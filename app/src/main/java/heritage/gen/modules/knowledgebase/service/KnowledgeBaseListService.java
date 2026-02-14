package heritage.gen.modules.knowledgebase.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.infrastructure.file.FileStorageService;
import heritage.gen.modules.knowledgebase.model.KnowledgeBaseEntity;
import heritage.gen.modules.knowledgebase.model.KnowledgeBaseListItemDTO;
import heritage.gen.modules.knowledgebase.model.KnowledgeBaseStatsDTO;
import heritage.gen.modules.knowledgebase.model.RagChatMessageEntity.MessageType;
import heritage.gen.modules.knowledgebase.model.VectorStatus;
import heritage.gen.modules.knowledgebase.repository.KnowledgeBaseRepository;
import heritage.gen.modules.knowledgebase.repository.RagChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * 知识库查询服务
 * 负责知识库列表和详情的查询
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeBaseListService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final RagChatMessageRepository ragChatMessageRepository;
    private final FileStorageService fileStorageService;

    /**
     * 获取所有知识库列表
     */
    public List<KnowledgeBaseListItemDTO> listKnowledgeBases() {
        List<KnowledgeBaseEntity> entities = knowledgeBaseRepository.findAllByOrderByUploadedAtDesc();
        return entities.stream()
            .map(this::toDTO)
            .toList();
    }

    /**
     * 根据ID获取知识库详情
     */
    public Optional<KnowledgeBaseListItemDTO> getKnowledgeBase(Long id) {
        return knowledgeBaseRepository.findById(id)
            .map(this::toDTO);
    }

    /**
     * 根据ID获取知识库实体（用于删除等操作）
     */
    public Optional<KnowledgeBaseEntity> getKnowledgeBaseEntity(Long id) {
        return knowledgeBaseRepository.findById(id);
    }

    /**
     * 根据ID列表获取知识库名称列表
     */
    public List<String> getKnowledgeBaseNames(List<Long> ids) {
        return ids.stream()
            .map(id -> knowledgeBaseRepository.findById(id)
                .map(KnowledgeBaseEntity::getName)
                .orElse("未知知识库"))
            .toList();
    }

    // ========== 分类管理 ==========

    /**
     * 获取所有分类
     */
    public List<String> getAllCategories() {
        return knowledgeBaseRepository.findAllCategories();
    }

    /**
     * 根据分类获取知识库列表
     */
    public List<KnowledgeBaseListItemDTO> listByCategory(String category) {
        List<KnowledgeBaseEntity> entities;
        if (category == null || category.isBlank()) {
            entities = knowledgeBaseRepository.findByCategoryIsNullOrderByUploadedAtDesc();
        } else {
            entities = knowledgeBaseRepository.findByCategoryOrderByUploadedAtDesc(category);
        }
        return entities.stream()
            .map(this::toDTO)
            .toList();
    }

    /**
     * 更新知识库分类
     */
    @Transactional
    public void updateCategory(Long id, String category) {
        KnowledgeBaseEntity entity = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("知识库不存在"));
        entity.setCategory(category != null && !category.isBlank() ? category : null);
        knowledgeBaseRepository.save(entity);
        log.info("更新知识库分类: id={}, category={}", id, category);
    }

    // ========== 搜索功能 ==========

    /**
     * 按关键词搜索知识库
     */
    public List<KnowledgeBaseListItemDTO> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return listKnowledgeBases();
        }
        // 搜索名称或原始文件名包含关键词的知识库
        List<KnowledgeBaseEntity> entities = knowledgeBaseRepository.findAll().stream()
            .filter(entity ->
                entity.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                entity.getOriginalFilename().toLowerCase().contains(keyword.toLowerCase()) ||
                (entity.getCategory() != null && entity.getCategory().toLowerCase().contains(keyword.toLowerCase()))
            )
            .toList();
        return entities.stream()
            .map(this::toDTO)
            .toList();
    }

    // ========== 排序功能 ==========

    /**
     * 按指定字段排序获取知识库列表
     */
    public List<KnowledgeBaseListItemDTO> listSorted(String sortBy) {
        List<KnowledgeBaseEntity> entities;
        switch (sortBy != null ? sortBy.toLowerCase() : "time") {
            case "size" -> entities = knowledgeBaseRepository.findAllByOrderByFileSizeDesc();
            case "access" -> entities = knowledgeBaseRepository.findAllByOrderByAccessCountDesc();
            case "question" -> entities = knowledgeBaseRepository.findAllByOrderByQuestionCountDesc();
            default -> entities = knowledgeBaseRepository.findAllByOrderByUploadedAtDesc();
        }
        return entities.stream()
            .map(this::toDTO)
            .toList();
    }

    // ========== 统计功能 ==========

    /**
     * 获取知识库统计信息
     * 总提问次数从用户消息数统计，确保多知识库提问只算一次
     */
    public KnowledgeBaseStatsDTO getStatistics() {
        return new KnowledgeBaseStatsDTO(
            knowledgeBaseRepository.count(),
            ragChatMessageRepository.countByType(MessageType.USER),  // 真正的提问次数
            knowledgeBaseRepository.sumAccessCount(),
            knowledgeBaseRepository.countByVectorStatus(VectorStatus.COMPLETED),
            knowledgeBaseRepository.countByVectorStatus(VectorStatus.PROCESSING)
        );
    }

    // ========== 下载功能 ==========

    /**
     * 下载知识库文件
     */
    public byte[] downloadFile(Long id) {
        KnowledgeBaseEntity entity = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.KNOWLEDGE_BASE_NOT_FOUND, "知识库不存在"));

        String storageKey = entity.getStorageKey();
        if (storageKey == null || storageKey.isBlank()) {
            throw new BusinessException(ErrorCode.STORAGE_DOWNLOAD_FAILED, "文件存储信息不存在");
        }

        log.info("下载知识库文件: id={}, filename={}", id, entity.getOriginalFilename());
        return fileStorageService.downloadFile(storageKey);
    }

    /**
     * 获取知识库文件信息（用于下载）
     */
    public KnowledgeBaseEntity getEntityForDownload(Long id) {
        return knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.KNOWLEDGE_BASE_NOT_FOUND, "知识库不存在"));
    }

    // ========== 辅助方法 ==========

    /**
     * 将实体转换为DTO
     */
    private KnowledgeBaseListItemDTO toDTO(KnowledgeBaseEntity entity) {
        return new KnowledgeBaseListItemDTO(
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

