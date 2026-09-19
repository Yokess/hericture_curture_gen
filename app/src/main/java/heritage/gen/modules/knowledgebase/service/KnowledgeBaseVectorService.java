package heritage.gen.modules.knowledgebase.service;

import heritage.gen.modules.knowledgebase.repository.VectorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 知识库向量存储服务
 * 负责文档分块、向量化和检索
 */
@Slf4j
@Service
public class KnowledgeBaseVectorService {
    
    private final VectorStore vectorStore;
    private final TextSplitter textSplitter;
    private final VectorRepository vectorRepository;
    
    public KnowledgeBaseVectorService(VectorStore vectorStore, VectorRepository vectorRepository) {
        this.vectorStore = vectorStore;
        this.vectorRepository = vectorRepository;
        // 使用TokenTextSplitter，每个chunk约500 tokens，重叠50 tokens
        this.textSplitter = new TokenTextSplitter();
    }
    
    /**
     * 将知识库内容向量化并存储
     *
     * @param knowledgeBaseId 知识库ID
     * @param content 知识库文本内容
     */
    @Transactional
    public void vectorizeAndStore(Long knowledgeBaseId, String content) {
        log.info("开始向量化知识库: kbId={}, contentLength={}", knowledgeBaseId, content.length());

        try {
            // 1. 先删除该知识库的旧向量数据
            deleteByKnowledgeBaseId(knowledgeBaseId);

            // 2. 将文本分块
            List<Document> chunks = textSplitter.apply(
                List.of(new Document(content))
            );

            log.info("文本分块完成: {} 个chunks", chunks.size());

            // 3. 为每个chunk添加metadata（知识库ID）
            // 统一使用 String 类型存储，确保查询一致性
            chunks.forEach(chunk -> chunk.getMetadata().put("kb_id", knowledgeBaseId.toString()));

            // 4. 向量化并存储（分批处理，每批最多10个，避免超过API限制）
            int batchSize = 10;
            int totalChunks = chunks.size();
            int processedChunks = 0;

            for (int i = 0; i < totalChunks; i += batchSize) {
                int endIndex = Math.min(i + batchSize, totalChunks);
                List<Document> batch = chunks.subList(i, endIndex);

                log.info("处理批次 {}/{}: 向量化 {} 个chunks",
                    (i / batchSize + 1),
                    (totalChunks + batchSize - 1) / batchSize,
                    batch.size());

                vectorStore.add(batch);
                processedChunks += batch.size();

                log.debug("已处理 {}/{} 个chunks", processedChunks, totalChunks);
            }

            log.info("知识库向量化完成: kbId={}, totalChunks={}", knowledgeBaseId, chunks.size());

        } catch (Exception e) {
            log.error("向量化知识库失败: kbId={}, error={}", knowledgeBaseId, e.getMessage(), e);
            throw new RuntimeException("向量化知识库失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 基于多个知识库进行相似度搜索
     * 
     * @param query 查询文本
     * @param knowledgeBaseIds 知识库ID列表（如果为空则搜索所有）
     * @param topK 返回top K个结果
     * @return 相关文档列表
     */
    public List<Document> similaritySearch(String query, List<Long> knowledgeBaseIds, int topK) {
        log.info("向量相似度搜索: query={}, kbIds={}, topK={}", query, knowledgeBaseIds, topK);
        
        try {
            // 1. 语义召回：pgvector 的余弦相似度检索。
            List<Document> semanticCandidates = filterByKnowledgeBase(
                    vectorStore.similaritySearch(query), knowledgeBaseIds);

            // 2. 词法召回：PostgreSQL full-text search。它独立于 embedding，因此可补足
            // 专有名词、工艺术语和短查询的命中。
            List<Document> keywordCandidates = vectorRepository.keywordSearch(query, 20).stream()
                    .map(row -> new Document(row.get("content"), Map.of("kb_id", row.get("kb_id"))))
                    .toList();
            keywordCandidates = filterByKnowledgeBase(keywordCandidates, knowledgeBaseIds);

            // 3. RRF 融合重排：避免任一检索通道单独主导最终上下文。
            List<Document> results = reciprocalRankFuse(semanticCandidates, keywordCandidates, topK);

            log.info("Hybrid RAG 搜索完成: semanticCandidates={}, keywordCandidates={}, results={}",
                    semanticCandidates.size(), keywordCandidates.size(), results.size());
            return results;
            
        } catch (Exception e) {
            log.error("向量搜索失败: {}", e.getMessage(), e);
            throw new RuntimeException("向量搜索失败: " + e.getMessage(), e);
        }
    }

    private List<Document> filterByKnowledgeBase(List<Document> documents, List<Long> knowledgeBaseIds) {
        if (knowledgeBaseIds == null || knowledgeBaseIds.isEmpty()) {
            return documents;
        }
        return documents.stream()
                .filter(doc -> {
                    Object kbId = doc.getMetadata().get("kb_id");
                    if (kbId == null) return false;
                    try {
                        return knowledgeBaseIds.contains(Long.parseLong(kbId.toString()));
                    } catch (NumberFormatException ignored) {
                        return false;
                    }
                })
                .toList();
    }

    /** Reciprocal Rank Fusion (RRF) reranker for semantic and keyword candidates. */
    private List<Document> reciprocalRankFuse(List<Document> semantic, List<Document> keyword, int topK) {
        final int rrfK = 60;
        Map<String, Document> documents = new LinkedHashMap<>();
        Map<String, Double> scores = new HashMap<>();
        addRrfScores(semantic, documents, scores, rrfK);
        addRrfScores(keyword, documents, scores, rrfK);

        return documents.entrySet().stream()
                .sorted(Comparator.comparingDouble((Map.Entry<String, Document> entry) ->
                        scores.get(entry.getKey())).reversed())
                .limit(topK)
                .map(Map.Entry::getValue)
                .toList();
    }

    private void addRrfScores(List<Document> rankedDocuments, Map<String, Document> documents,
                              Map<String, Double> scores, int rrfK) {
        for (int rank = 0; rank < rankedDocuments.size(); rank++) {
            Document document = rankedDocuments.get(rank);
            String key = document.getMetadata().getOrDefault("kb_id", "") + "\n" + document.getText();
            documents.putIfAbsent(key, document);
            scores.merge(key, 1.0 / (rrfK + rank + 1), Double::sum);
        }
    }
    
    /**
     * 删除指定知识库的所有向量数据
     * 委托给 VectorRepository 处理
     * 
     * @param knowledgeBaseId 知识库ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteByKnowledgeBaseId(Long knowledgeBaseId) {
        try {
            vectorRepository.deleteByKnowledgeBaseId(knowledgeBaseId);
        } catch (Exception e) {
            log.error("删除向量数据失败: kbId={}, error={}", knowledgeBaseId, e.getMessage(), e);
            // 删除失败时禁止继续追加新向量，否则重试会产生重复数据。
            throw new RuntimeException("删除旧向量数据失败: " + e.getMessage(), e);
        }
    }
}
