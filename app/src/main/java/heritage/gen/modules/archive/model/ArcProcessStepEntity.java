package heritage.gen.modules.archive.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "arc_process_steps")
@Data
public class ArcProcessStepEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id")
    private Long videoId;

    @Column(name = "step_order")
    private Integer stepOrder;

    @Column(name = "step_name", length = 100)
    private String stepName;    // AI 识别出的工序名

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // AI 生成的描述

    @Column(name = "keyframe_key", columnDefinition = "TEXT")
    private String keyframeKey; // 关键帧在 MinIO 的路径

    @Column(name = "start_time_ms")
    private Long startTimeMs;   // 视频时间点 (毫秒)

    @Column(name = "end_time_ms")
    private Long endTimeMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}