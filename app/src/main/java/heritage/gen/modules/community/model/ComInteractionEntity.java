package heritage.gen.modules.community.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "com_interactions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_com_interactions_user_post_type", columnNames = {"user_id", "post_id", "type"})
}, indexes = {
        @Index(name = "idx_com_interactions_post", columnList = "post_id"),
        @Index(name = "idx_com_interactions_user", columnList = "user_id")
})
@Data
public class ComInteractionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(length = 20, nullable = false)
    private String type;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
