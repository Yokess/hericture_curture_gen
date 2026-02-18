package heritage.gen.modules.community.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "com_comments", indexes = {
        @Index(name = "idx_com_comments_post", columnList = "post_id"),
        @Index(name = "idx_com_comments_parent", columnList = "parent_id"),
        @Index(name = "idx_com_comments_created", columnList = "created_at")
})
@Data
public class ComCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 1000, nullable = false)
    private String content;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isDeleted == null) isDeleted = false;
    }
}
