package heritage.gen.modules.community.repository;

import heritage.gen.modules.community.model.ComPostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ComPostRepository extends JpaRepository<ComPostEntity, Long> {

    @Query(value = """
            select * from com_posts
            where is_deleted = false
              and (:projectId is null or project_id = :projectId)
              and (:tagJson is null or tags @> cast(:tagJson as jsonb))
            order by is_pinned desc,
                     case when :sortKey = 'likes' then like_count end desc,
                     case when :sortKey = 'popular' then view_count end desc,
                     created_at desc
            """,
            countQuery = """
            select count(1) from com_posts
            where is_deleted = false
              and (:projectId is null or project_id = :projectId)
              and (:tagJson is null or tags @> cast(:tagJson as jsonb))
            """,
            nativeQuery = true)
    Page<ComPostEntity> pageVisible(@Param("projectId") Long projectId,
                                   @Param("tagJson") String tagJson,
                                   @Param("sortKey") String sortKey,
                                   Pageable pageable);

    Optional<ComPostEntity> findByIdAndIsDeletedFalse(Long id);

    Optional<ComPostEntity> findFirstByArtifactIdAndIsDeletedFalseOrderByCreatedAtDesc(Long artifactId);
}
