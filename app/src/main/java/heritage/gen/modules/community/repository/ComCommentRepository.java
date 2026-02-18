package heritage.gen.modules.community.repository;

import heritage.gen.modules.community.model.ComCommentEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface ComCommentRepository extends JpaRepository<ComCommentEntity, Long> {

    List<ComCommentEntity> findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(Long postId);

    long countByPostIdAndIsDeletedFalse(Long postId);

    interface PostCount {
        Long getPostId();
        Long getCnt();
    }

    @Query("""
            select c.postId as postId, count(c) as cnt
            from ComCommentEntity c
            where c.isDeleted = false and c.postId in :postIds
            group by c.postId
            """)
    List<PostCount> countByPostIds(@Param("postIds") Set<Long> postIds);
}
