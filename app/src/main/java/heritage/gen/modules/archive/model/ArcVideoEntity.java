package heritage.gen.modules.archive.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "arc_videos")
@Data
public class ArcVideoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "video_key", columnDefinition = "TEXT")
    private String videoKey; // MinIO 文件路径

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    // 状态: PENDING, PROCESSING, COMPLETED, FAILED
    @Column(name = "analysis_status", length = 20)
    private String analysisStatus;

    @Column(name = "error_msg", columnDefinition = "TEXT")
    private String errorMsg;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isDeleted == null) isDeleted = false;
        if (analysisStatus == null) analysisStatus = "PENDING";
    }
}