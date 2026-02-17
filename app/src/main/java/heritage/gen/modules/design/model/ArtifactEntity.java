package heritage.gen.modules.design.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "gen_artifacts")
@Data
public class ArtifactEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "design_name")
    private String designName;

    @Column(name = "design_concept", columnDefinition = "TEXT")
    private String designConcept;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "concept_data", columnDefinition = "jsonb")
    private Map<String, Object> conceptData;

    @Column(name = "blueprint_url")
    private String blueprintUrl;

    @Column(name = "product_shot_url")
    private String productShotUrl;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_urls", columnDefinition = "TEXT[]")
    private String[] imageUrls;

    @Column(name = "selected_index")
    private Integer selectedIndex = 0;

    @Column(name = "status", length = 20)
    private String status = "DRAFT";

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "generation_metadata", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private java.util.Map<String, Object> generationMetadata;

    @Column(name = "chat_history", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private java.util.List<java.util.Map<String, String>> chatHistory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "market_analysis", columnDefinition = "jsonb")
    private Map<String, Object> marketAnalysis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "technical_feasibility", columnDefinition = "jsonb")
    private Map<String, Object> technicalFeasibility;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "risk_assessment", columnDefinition = "jsonb")
    private Map<String, Object> riskAssessment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "DRAFT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
