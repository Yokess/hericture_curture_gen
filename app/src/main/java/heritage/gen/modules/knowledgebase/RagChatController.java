package heritage.gen.modules.knowledgebase;

import heritage.gen.common.result.Result;
import heritage.gen.modules.knowledgebase.model.RagChatDTO.*;
import heritage.gen.modules.knowledgebase.service.KnowledgeBaseQueryService;
import heritage.gen.modules.knowledgebase.service.RagChatSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * RAG 聊天控制器
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class RagChatController {

    private final RagChatSessionService sessionService;
    private final KnowledgeBaseQueryService queryService;  // 新增注入，用于访问 ThreadLocal

    /**
     * 创建新会话
     */
    @PostMapping("/api/rag-chat/sessions")
    public Result<SessionDTO> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return Result.success(sessionService.createSession(request));
    }

    /**
     * 获取会话列表
     */
    @GetMapping("/api/rag-chat/sessions")
    public Result<List<SessionListItemDTO>> listSessions() {
        return Result.success(sessionService.listSessions());
    }

    /**
     * 获取会话详情（包含消息历史）
     */
    @GetMapping("/api/rag-chat/sessions/{sessionId}")
    public Result<SessionDetailDTO> getSessionDetail(@PathVariable Long sessionId) {
        return Result.success(sessionService.getSessionDetail(sessionId));
    }

    /**
     * 更新会话标题
     */
    @PutMapping("/api/rag-chat/sessions/{sessionId}/title")
    public Result<Void> updateSessionTitle(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateTitleRequest request) {
        sessionService.updateSessionTitle(sessionId, request.title());
        return Result.success(null);
    }

    /**
     * 切换会话置顶状态
     */
    @PutMapping("/api/rag-chat/sessions/{sessionId}/pin")
    public Result<Void> togglePin(@PathVariable Long sessionId) {
        sessionService.togglePin(sessionId);
        return Result.success(null);
    }

    /**
     * 更新会话知识库
     */
    @PutMapping("/api/rag-chat/sessions/{sessionId}/knowledge-bases")
    public Result<Void> updateSessionKnowledgeBases(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateKnowledgeBasesRequest request) {
        sessionService.updateSessionKnowledgeBases(sessionId, request.knowledgeBaseIds());
        return Result.success(null);
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/api/rag-chat/sessions/{sessionId}")
    public Result<Void> deleteSession(@PathVariable Long sessionId) {
        sessionService.deleteSession(sessionId);
        return Result.success(null);
    }

    /**
     * 发送消息（流式 SSE）
     * 流式响应设计：
     * 1. 先同步保存用户消息和创建 AI 消息占位
     * 2. 返回流式响应
     * 3. 流式完成后通过回调更新消息，并保存实际检索到的知识库来源
     */
    @PostMapping(value = "/api/rag-chat/sessions/{sessionId}/messages/stream",
                 produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> sendMessageStream(
            @PathVariable Long sessionId,
            @Valid @RequestBody SendMessageRequest request) {

        log.info("收到 RAG 聊天流式请求: sessionId={}, question={}", sessionId, request.question());

        // 1. 准备消息（保存用户消息，创建 AI 消息占位）
        Long messageId = sessionService.prepareStreamMessage(sessionId, request.question());

        // 2. 获取流式响应
        StringBuilder fullContent = new StringBuilder();

        return sessionService.getStreamAnswer(sessionId, request.question())
                .doOnNext(chunk -> {
                    fullContent.append(chunk);
                    // 可选：如果未来恢复逐字 streaming，这里可以做更细粒度的处理
                })
                // 使用 ServerSentEvent 包装，转义换行符避免破坏 SSE 格式
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk.replace("\n", "\\n").replace("\r", "\\r"))
                        .build())
                .doOnComplete(() -> {
                    // 3. 流式完成后更新消息内容 + 来源知识库
                    List<Long> sourceKbIds = KnowledgeBaseQueryService.SOURCE_KB_IDS.get();
                    String finalContent = fullContent.toString();

                    sessionService.completeStreamMessage(messageId, finalContent, sourceKbIds);

                    // 清理 ThreadLocal，防止线程复用污染
                    KnowledgeBaseQueryService.SOURCE_KB_IDS.remove();

                    log.info("RAG 聊天流式完成: sessionId={}, messageId={}, sourceKbIds={}",
                            sessionId, messageId, sourceKbIds);
                })
                .doOnError(e -> {
                    // 错误时也尽量保存已接收的内容和来源（如果有）
                    String content = !fullContent.isEmpty()
                            ? fullContent.toString()
                            : "【错误】回答生成失败：" + e.getMessage();

                    List<Long> sourceKbIds = KnowledgeBaseQueryService.SOURCE_KB_IDS.get();

                    sessionService.completeStreamMessage(messageId, content, sourceKbIds);

                    // 同样清理
                    KnowledgeBaseQueryService.SOURCE_KB_IDS.remove();

                    log.error("RAG 聊天流式错误: sessionId={}, messageId={}, sourceKbIds={}",
                            sessionId, messageId, sourceKbIds, e);
                });
    }
}