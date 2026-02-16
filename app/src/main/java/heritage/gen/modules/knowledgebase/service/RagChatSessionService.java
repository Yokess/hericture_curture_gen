package heritage.gen.modules.knowledgebase.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.knowledgebase.model.KnowledgeBaseEntity;
import heritage.gen.modules.knowledgebase.model.RagChatDTO.CreateSessionRequest;
import heritage.gen.modules.knowledgebase.model.RagChatDTO.SessionDTO;
import heritage.gen.modules.knowledgebase.model.RagChatDTO.SessionDetailDTO;
import heritage.gen.modules.knowledgebase.model.RagChatDTO.SessionListItemDTO;
import heritage.gen.modules.knowledgebase.model.RagChatMessageEntity;
import heritage.gen.modules.knowledgebase.model.RagChatSessionEntity;
import heritage.gen.modules.knowledgebase.repository.KnowledgeBaseRepository;
import heritage.gen.modules.knowledgebase.repository.RagChatMessageRepository;
import heritage.gen.modules.knowledgebase.repository.RagChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

/**
 * RAG 聊天会话服务
 * 提供RAG聊天会话的创建、获取、更新、删除等操作
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagChatSessionService {

    private final RagChatSessionRepository sessionRepository;
    private final RagChatMessageRepository messageRepository;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final KnowledgeBaseQueryService queryService;


    /**
     * 创建新会话
     */
    @Transactional
    public SessionDTO createSession(Long userId, CreateSessionRequest request) {
        // 验证知识库存在
        List<KnowledgeBaseEntity> knowledgeBases = knowledgeBaseRepository
            .findAllById(request.knowledgeBaseIds());

        if (knowledgeBases.size() != request.knowledgeBaseIds().size()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "部分知识库不存在");
        }

        // 创建会话
        RagChatSessionEntity session = new RagChatSessionEntity();
        session.setUserId(userId);
        session.setTitle(request.title() != null && !request.title().isBlank()
            ? request.title()
            : generateTitle(knowledgeBases));
        session.setKnowledgeBases(new HashSet<>(knowledgeBases));

        session = sessionRepository.save(session);

        log.info("创建 RAG 聊天会话: id={}, userId={}, title={}", session.getId(), userId, session.getTitle());

        return new SessionDTO(
            session.getId(),
            session.getTitle(),
            session.getKnowledgeBaseIds(),
            session.getCreatedAt()
        );
    }

    /**
     * 获取会话列表
     */
    public List<SessionListItemDTO> listSessions(Long userId) {
        List<RagChatSessionEntity> sessions = sessionRepository.findByUserIdOrderByIsPinnedDescUpdatedAtDesc(userId);
        return sessions.stream()
            .map(this::toSessionListItemDTO)
            .toList();
    }

    /**
     * 获取会话详情（包含消息）
     * 分两次查询避免笛卡尔积问题
     */
    public SessionDetailDTO getSessionDetail(Long userId, Long sessionId) {
        // 先加载会话和知识库
        RagChatSessionEntity session = sessionRepository.findByIdWithMessagesAndKnowledgeBases(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
        
        checkSessionOwner(session, userId);

        // 再加载消息
        List<RagChatMessageEntity> messages = messageRepository.findBySessionIdOrderByMessageOrderAsc(sessionId);

        return toSessionDetailDTO(session, messages);
    }

    /**
     * 准备流式消息（保存用户消息，创建 AI 消息占位）
     *
     * @return AI 消息的 ID
     */
    @Transactional
    public Long prepareStreamMessage(Long userId, Long sessionId, String question) {
        RagChatSessionEntity session = sessionRepository.findByIdWithKnowledgeBases(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
            
        checkSessionOwner(session, userId);

        // 获取当前消息数量作为起始顺序
        int nextOrder = session.getMessageCount();

        // 保存用户消息
        RagChatMessageEntity userMessage = new RagChatMessageEntity();
        userMessage.setSession(session);
        userMessage.setType(RagChatMessageEntity.MessageType.USER);
        userMessage.setContent(question);
        userMessage.setMessageOrder(nextOrder);
        userMessage.setCompleted(true);
        messageRepository.save(userMessage);

        // 创建 AI 消息占位（未完成）
        RagChatMessageEntity assistantMessage = new RagChatMessageEntity();
        assistantMessage.setSession(session);
        assistantMessage.setType(RagChatMessageEntity.MessageType.ASSISTANT);
        assistantMessage.setContent("");
        assistantMessage.setMessageOrder(nextOrder + 1);
        assistantMessage.setCompleted(false);
        assistantMessage = messageRepository.save(assistantMessage);

        // 更新会话消息数量
        session.setMessageCount(nextOrder + 2);
        sessionRepository.save(session);

        log.info("准备流式消息: sessionId={}, messageId={}", sessionId, assistantMessage.getId());

        return assistantMessage.getId();
    }

    /**
     * 流式响应完成后更新消息
     */
    @Transactional
    public void completeStreamMessage(Long messageId, String content, List<Long> sourceKnowledgeBaseIds) {
        RagChatMessageEntity message = messageRepository.findById(messageId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "消息不存在"));

        message.setContent(content);
        message.setCompleted(true);

        // 保存来源知识库ID列表（JSON格式）
        if (sourceKnowledgeBaseIds != null && !sourceKnowledgeBaseIds.isEmpty()) {
            String json = sourceKnowledgeBaseIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(",", "[", "]"));
            message.setSourceKnowledgeBaseIds(json);
        }

        messageRepository.save(message);

        log.info("完成流式消息: messageId={}, contentLength={}, sourceKbIds={}",
            messageId, content.length(), sourceKnowledgeBaseIds);
    }

    /**
     * 获取流式回答
     */
    public Flux<String> getStreamAnswer(Long userId, Long sessionId, String question) {
        RagChatSessionEntity session = sessionRepository.findByIdWithKnowledgeBases(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
        
        checkSessionOwner(session, userId);

        List<Long> kbIds = session.getKnowledgeBaseIds();

        return queryService.answerQuestionStream(kbIds, question);
    }

    /**
     * 更新会话标题
     */
    @Transactional
    public void updateSessionTitle(Long userId, Long sessionId, String title) {
        RagChatSessionEntity session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
        
        checkSessionOwner(session, userId);

        session.setTitle(title);
        sessionRepository.save(session);

        log.info("更新会话标题: sessionId={}, title={}", sessionId, title);
    }

    /**
     * 切换会话置顶状态
     */
    @Transactional
    public void togglePin(Long userId, Long sessionId) {
        RagChatSessionEntity session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));

        checkSessionOwner(session, userId);

        // 处理 null 值（兼容旧数据）
        Boolean currentPinned = session.getIsPinned() != null ? session.getIsPinned() : false;
        session.setIsPinned(!currentPinned);
        sessionRepository.save(session);

        log.info("切换会话置顶状态: sessionId={}, isPinned={}", sessionId, session.getIsPinned());
    }

    /**
     * 更新会话的知识库关联
     */
    @Transactional
    public void updateSessionKnowledgeBases(Long userId, Long sessionId, List<Long> knowledgeBaseIds) {
        RagChatSessionEntity session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
        
        checkSessionOwner(session, userId);

        List<KnowledgeBaseEntity> knowledgeBases = knowledgeBaseRepository
            .findAllById(knowledgeBaseIds);

        session.setKnowledgeBases(new HashSet<>(knowledgeBases));
        sessionRepository.save(session);

        log.info("更新会话知识库: sessionId={}, kbIds={}", sessionId, knowledgeBaseIds);
    }

    /**
     * 删除会话
     */
    @Transactional
    public void deleteSession(Long userId, Long sessionId) {
        RagChatSessionEntity session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
            
        checkSessionOwner(session, userId);
        
        sessionRepository.delete(session);

        log.info("删除会话: sessionId={}", sessionId);
    }

    // ========== 私有方法 ==========
    
    private void checkSessionOwner(RagChatSessionEntity session, Long userId) {
        if (!userId.equals(session.getUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权访问此会话");
        }
    }

    private String generateTitle(List<KnowledgeBaseEntity> knowledgeBases) {
        if (knowledgeBases.isEmpty()) {
            return "新对话";
        }
        if (knowledgeBases.size() == 1) {
            return knowledgeBases.getFirst().getName();
        }
        return knowledgeBases.size() + " 个知识库对话";
    }

    /**
     * 转换会话实体为列表项DTO
     */
    private SessionListItemDTO toSessionListItemDTO(RagChatSessionEntity session) {
        List<String> kbNames = session.getKnowledgeBases().stream()
            .map(KnowledgeBaseEntity::getName)
            .toList();

        return new SessionListItemDTO(
            session.getId(),
            session.getTitle(),
            session.getMessageCount(),
            kbNames,
            session.getUpdatedAt(),
            session.getIsPinned()
        );
    }

    /**
     * 转换会话实体和消息列表为详情DTO
     */
    private SessionDetailDTO toSessionDetailDTO(RagChatSessionEntity session, List<RagChatMessageEntity> messages) {
        // 转换知识库列表
        List<heritage.gen.modules.knowledgebase.model.KnowledgeBaseListItemDTO> kbDTOs = session.getKnowledgeBases().stream()
            .map(this::toKnowledgeBaseDTO)
            .toList();

        // 转换消息列表
        List<heritage.gen.modules.knowledgebase.model.RagChatDTO.MessageDTO> messageDTOs = messages.stream()
            .map(this::toMessageDTO)
            .toList();

        return new SessionDetailDTO(
            session.getId(),
            session.getTitle(),
            kbDTOs,
            messageDTOs,
            session.getCreatedAt(),
            session.getUpdatedAt()
        );
    }

    /**
     * 转换消息实体为DTO
     */
    private heritage.gen.modules.knowledgebase.model.RagChatDTO.MessageDTO toMessageDTO(RagChatMessageEntity message) {
        // 解析来源知识库ID列表（JSON格式）
        List<Long> sourceKbIds = new ArrayList<>();
        if (message.getSourceKnowledgeBaseIds() != null && !message.getSourceKnowledgeBaseIds().isBlank()) {
            try {
                // 简单的JSON数组解析：[1,2,3] -> List<Long>
                String json = message.getSourceKnowledgeBaseIds().trim();
                if (json.startsWith("[") && json.endsWith("]")) {
                    String content = json.substring(1, json.length() - 1);
                    if (!content.isBlank()) {
                        sourceKbIds = Arrays.stream(content.split(","))
                            .map(String::trim)
                            .map(Long::parseLong)
                            .collect(Collectors.toList());
                    }
                }
            } catch (Exception e) {
                log.warn("解析消息来源知识库ID失败: messageId={}, json={}", message.getId(), message.getSourceKnowledgeBaseIds(), e);
            }
        }

        return new heritage.gen.modules.knowledgebase.model.RagChatDTO.MessageDTO(
            message.getId(),
            message.getTypeString(),
            message.getContent(),
            message.getCreatedAt(),
            sourceKbIds
        );
    }

    /**
     * 转换知识库实体为DTO
     */
    private heritage.gen.modules.knowledgebase.model.KnowledgeBaseListItemDTO toKnowledgeBaseDTO(KnowledgeBaseEntity entity) {
        return new heritage.gen.modules.knowledgebase.model.KnowledgeBaseListItemDTO(
            entity.getId(),
            entity.getName(),
            entity.getCategory(),
            entity.getOriginalFilename(),
            entity.getFileSize(),
            entity.getContentType(),
            entity.getUploadedAt(),
            entity.getLastAccessedAt(),
            entity.getAccessCount(),
            entity.getQuestionCount(),
            entity.getVectorStatus(),
            entity.getVectorError(),
            entity.getChunkCount()
        );
    }
}
