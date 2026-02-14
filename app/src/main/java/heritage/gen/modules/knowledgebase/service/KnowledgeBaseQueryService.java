package heritage.gen.modules.knowledgebase.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.knowledgebase.model.QueryRequest;
import heritage.gen.modules.knowledgebase.model.QueryResponse;
import heritage.gen.modules.knowledgebase.tool.HeritageDataTool;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 知识库查询服务
 * 基于向量搜索的RAG问答
 */
@Slf4j
@Service
public class KnowledgeBaseQueryService {

    private final ChatClient chatClient;
    private final KnowledgeBaseVectorService vectorService;
    private final KnowledgeBaseListService listService;
    private final KnowledgeBaseCountService countService;
    private final HeritageDataTool heritageDataTool;
    private final PromptTemplate systemPromptTemplate;
    private final PromptTemplate userPromptTemplate;

    /**
     * ThreadLocal 用于存储当前查询的来源知识库ID列表
     * 在 answerQuestionStream 中设置，在 Controller 中获取后清除
     */
    public static final ThreadLocal<List<Long>> SOURCE_KB_IDS = new ThreadLocal<>();

    public KnowledgeBaseQueryService(
            ChatClient.Builder chatClientBuilder,
            KnowledgeBaseVectorService vectorService,
            KnowledgeBaseListService listService,
            KnowledgeBaseCountService countService,
            HeritageDataTool heritageDataTool,
            @Value("classpath:prompts/knowledgebase-query-system.st") Resource systemPromptResource,
            @Value("classpath:prompts/knowledgebase-query-user.st") Resource userPromptResource) throws IOException {
        this.chatClient = chatClientBuilder.build();
        this.vectorService = vectorService;
        this.listService = listService;
        this.countService = countService;
        this.heritageDataTool = heritageDataTool;
        this.systemPromptTemplate = new PromptTemplate(systemPromptResource.getContentAsString(StandardCharsets.UTF_8));
        this.userPromptTemplate = new PromptTemplate(userPromptResource.getContentAsString(StandardCharsets.UTF_8));
    }

    /**
     * 基于单个知识库回答用户问题
     *
     * @param knowledgeBaseId 知识库ID
     * @param question 用户问题
     * @return AI回答
     */
    public String answerQuestion(Long knowledgeBaseId, String question) {
        return answerQuestion(List.of(knowledgeBaseId), question);
    }

    /**
     * 基于多个知识库回答用户问题（RAG）
     *
     * @param knowledgeBaseIds 知识库ID列表
     * @param question 用户问题
     * @return AI回答
     */
    public String answerQuestion(List<Long> knowledgeBaseIds, String question) {
        log.info("收到知识库提问: kbIds={}, question={}", knowledgeBaseIds, question);

        // 1. 验证知识库是否存在并更新问题计数（合并数据库操作）
        countService.updateQuestionCounts(knowledgeBaseIds);

        // 2. 使用向量搜索检索相关文档（RAG）
        List<Document> relevantDocs = vectorService.similaritySearch(question, knowledgeBaseIds, 5);

        if (relevantDocs.isEmpty()) {
            return "抱歉，在选定的知识库中没有找到相关信息。请尝试调整问题或选择其他知识库。";
        }

        // 3. 构建上下文（合并检索到的文档）
        String context = relevantDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.debug("检索到 {} 个相关文档片段", relevantDocs.size());

        // 4. 构建提示词
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(context, question, knowledgeBaseIds);

        try {
            // 5. 调用AI生成回答
            String answer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            log.info("知识库问答完成: kbIds={}", knowledgeBaseIds);
            return answer;

        } catch (Exception e) {
            log.error("知识库问答失败: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.KNOWLEDGE_BASE_QUERY_FAILED, "知识库查询失败：" + e.getMessage());
        }
    }

    /**
     * 构建系统提示词
     */
    private String buildSystemPrompt() {
        return systemPromptTemplate.render();
    }

    /**
     * 构建用户提示词
     */
    private String buildUserPrompt(String context, String question, List<Long> knowledgeBaseIds) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("context", context);
        variables.put("question", question);
        return userPromptTemplate.render(variables);
    }

    /**
     * 查询知识库并返回完整响应
     */
    public QueryResponse queryKnowledgeBase(QueryRequest request) {
        String answer = answerQuestion(request.knowledgeBaseIds(), request.question());

        // 获取知识库名称（多个知识库用逗号分隔）
        List<String> kbNames = listService.getKnowledgeBaseNames(request.knowledgeBaseIds());
        String kbNamesStr = String.join("、", kbNames);

        // 使用第一个知识库ID作为主要标识（兼容前端）
        Long primaryKbId = request.knowledgeBaseIds().getFirst();

        return new QueryResponse(answer, primaryKbId, kbNamesStr);
    }

    /**
     * 流式查询知识库（SSE）
     *
     * @param knowledgeBaseIds 知识库ID列表
     * @param question 用户问题
     * @return 流式响应
     */
    public Flux<String> answerQuestionStream(List<Long> knowledgeBaseIds, String question) {
        log.info("收到知识库流式提问: kbIds={}, question={}", knowledgeBaseIds, question);

        try {
            // 1. 验证知识库是否存在并更新问题计数
            countService.updateQuestionCounts(knowledgeBaseIds);

            // 2. 使用向量搜索检索相关文档
            List<Document> relevantDocs = vectorService.similaritySearch(question, knowledgeBaseIds, 5);

            if (relevantDocs.isEmpty()) {
                return Flux.just("抱歉，在选定的知识库中没有找到相关信息。请尝试调整问题或选择其他知识库。");
            }

            // 3. 提取实际检索到的文档所属的知识库ID（去重）
            List<Long> sourceKbIds = relevantDocs.stream()
                    .map(doc -> doc.getMetadata().get("kb_id"))
                    .filter(Objects::nonNull)
                    .map(kbId -> kbId instanceof Long ? (Long) kbId : Long.parseLong(kbId.toString()))
                    .distinct()
                    .collect(Collectors.toList());

            // 存储到 ThreadLocal 供 Controller 使用
            SOURCE_KB_IDS.set(sourceKbIds);
            log.debug("检索到的文档来源知识库: {}", sourceKbIds);

            // 4. 构建上下文
            String context = relevantDocs.stream()
                    .map(Document::getText)
                    .collect(Collectors.joining("\n\n---\n\n"));

            log.debug("检索到 {} 个相关文档片段", relevantDocs.size());

            // 4. 构建提示词
            String systemPrompt = buildSystemPrompt();
            String userPrompt = buildUserPrompt(context, question, knowledgeBaseIds);


            // 5. 调用AI生成回答（注册工具）
            // 注意：由于 Spring AI 2.0.0-M1 在 streaming 模式下处理 Qwen 模型的 tool calling 有 bug
            // （toolName 在后续 chunk 中为空，导致 IllegalArgumentException），暂时使用非流式调用
            log.info("开始调用AI生成回答: kbIds={}", knowledgeBaseIds);

            String fullAnswer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .tools(heritageDataTool)  // ✅ 传递工具实例
                    .call()
                    .content();
            log.info("完成知识库回答: kbIds={}, answerLength={}", knowledgeBaseIds, fullAnswer.length());

            // 将完整回答包装成 Flux 以兼容 SSE 接口
            return Flux.just(fullAnswer);

        } catch (Exception e) {
            log.error("知识库流式问答失败: {}", e.getMessage(), e);
            return Flux.just("【错误】知识库查询失败：" + e.getMessage());
        }
    }

}

