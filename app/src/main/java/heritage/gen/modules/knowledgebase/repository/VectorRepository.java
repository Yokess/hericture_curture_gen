package heritage.gen.modules.knowledgebase.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 向量存储Repository
 * 负责向量数据的增删改查操作
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class VectorRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * 删除指定知识库的所有向量数据
     * 使用 SQL 直接删除，利用数据库索引和删除能力
     * <p>
     * Spring AI PgVectorStore 默认表名为 vector_store，元数据存储在 metadata 字段（JSONB类型）
     * 
     * @param knowledgeBaseId 知识库ID
     * @return 删除的行数
     */
    @Transactional(rollbackFor = Exception.class)
    public int deleteByKnowledgeBaseId(Long knowledgeBaseId) {
        log.info("开始删除知识库向量数据: kbId={}", knowledgeBaseId);
        
        /* 
         * 注意：
         * 1. metadata 字段是 json 类型，不支持 jsonb_exists 函数。
         * 2. 使用 metadata->>'key' IS NOT NULL 来替代键存在性检查，这在 json/jsonb 下都有效。
         * 3. 这种写法完全避开了 PostgreSQL 的 '?' 操作符，不会引起 JDBC 占位符冲突。
         */
        String sql = """
            DELETE FROM vector_store
            WHERE metadata->>'kb_id' = ?
               OR (metadata->>'kb_id_long' IS NOT NULL AND (metadata->>'kb_id_long')::bigint = ?)
            """;
        
        try {
            // 第一个参数转为 String 匹配 kb_id，第二个参数保持 Long 匹配 kb_id_long
            int deletedRows = jdbcTemplate.update(sql, knowledgeBaseId.toString(), knowledgeBaseId);
            
            if (deletedRows > 0) {
                log.info("成功删除知识库向量数据: kbId={}, 删除行数={}", knowledgeBaseId, deletedRows);
            } else {
                log.info("未找到相关向量数据，无需删除: kbId={}", knowledgeBaseId);
            }
            
            return deletedRows;
            
        } catch (Exception e) {
            log.error("执行删除向量 SQL 失败: kbId={}, error={}", knowledgeBaseId, e.getMessage());
            // 抛出异常以触发事务回滚
            throw new RuntimeException("删除向量数据失败", e);
        }
    }    

    /**
     * 基于 PostgreSQL 全文索引语法执行词法召回。
     *
     * <p>向量库仍然是语义召回的来源；该查询提供独立的关键词候选集，随后由
     * {@code KnowledgeBaseVectorService} 与语义候选集融合、重排。这里保留 kb_id
     * 元数据，使服务层能执行与向量检索一致的知识库范围过滤。</p>
     */
    public List<Map<String, String>> keywordSearch(String query, int limit) {
        String sql = """
            SELECT content, metadata->>'kb_id' AS kb_id
            FROM vector_store
            WHERE to_tsvector('simple', COALESCE(content, ''))
                    @@ websearch_to_tsquery('simple', ?)
            ORDER BY ts_rank_cd(
                    to_tsvector('simple', COALESCE(content, '')),
                    websearch_to_tsquery('simple', ?)
                ) DESC
            LIMIT ?
            """;

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> Map.of(
                        "content", rs.getString("content"),
                        "kb_id", rs.getString("kb_id") == null ? "" : rs.getString("kb_id")),
                query, query, limit);
    }
}

