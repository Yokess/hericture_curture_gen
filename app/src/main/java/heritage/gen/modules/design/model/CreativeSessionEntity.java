package heritage.gen.modules.design.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 创作会话实体
 * 对应 gen_creative_sessions 表
 */
@Entity
@Table(name = "gen_creative_sessions")
@Data
public class CreativeSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 用户 ID
    @Column(nullable = false)
    private Long userId;

    // 会话标题
    @Column(length = 100)
    private String title;

    // 对话状态
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SessionStatus status;

    // 最终生成的 Prompt (由 DeepSeek 优化后)
    @Column(columnDefinition = "text")
    private String finalPrompt;

    // 创建时间
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = SessionStatus.CHATTING;
        }
    }
}
