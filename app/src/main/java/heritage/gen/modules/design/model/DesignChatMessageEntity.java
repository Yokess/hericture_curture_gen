package heritage.gen.modules.design.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设计对话消息实体
 * 存储与总设计师的对话历史
 */
@Entity
@Table(name = "gen_design_chat_messages", indexes = {
        @Index(name = "idx_design_chat_session", columnList = "sessionId")
})
@Data
public class DesignChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 关联 gen_creative_sessions
    @Column(nullable = false)
    private Long sessionId;

    // 消息角色 (USER, ASSISTANT)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    // 消息内容
    @Column(nullable = false, columnDefinition = "text")
    private String content;

    // 创建时间
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
