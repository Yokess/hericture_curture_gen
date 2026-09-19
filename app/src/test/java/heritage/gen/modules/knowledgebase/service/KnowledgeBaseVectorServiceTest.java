package heritage.gen.modules.knowledgebase.service;

import heritage.gen.modules.knowledgebase.repository.VectorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class KnowledgeBaseVectorServiceTest {

    @Test
    void fusesSemanticAndKeywordCandidatesAndFiltersKnowledgeBase() {
        VectorStore vectorStore = mock(VectorStore.class);
        VectorRepository repository = mock(VectorRepository.class);
        KnowledgeBaseVectorService service = new KnowledgeBaseVectorService(vectorStore, repository);

        Document semantic = new Document("语义命中的苏绣工艺", Map.of("kb_id", "1"));
        Document anotherKnowledgeBase = new Document("不应出现在结果中的内容", Map.of("kb_id", "2"));
        when(vectorStore.similaritySearch("苏绣"))
                .thenReturn(List.of(semantic, anotherKnowledgeBase));
        when(repository.keywordSearch("苏绣", 20)).thenReturn(List.of(
                Map.of("content", "关键词命中的苏绣传承人", "kb_id", "1"),
                Map.of("content", "不应出现在结果中的内容", "kb_id", "2")));

        List<Document> results = service.similaritySearch("苏绣", List.of(1L), 5);

        assertEquals(List.of("语义命中的苏绣工艺", "关键词命中的苏绣传承人"),
                results.stream().map(Document::getText).toList());
    }
}
