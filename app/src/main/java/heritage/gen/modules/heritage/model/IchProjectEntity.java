package heritage.gen.modules.heritage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 非遗项目实体
 */
@Entity
@Table(name = "ich_projects", indexes = {
        @Index(name = "idx_project_official_id", columnList = "officialId", unique = true),
        @Index(name = "idx_project_category", columnList = "category"),
        @Index(name = "idx_project_location", columnList = "location")
})
public class IchProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 官方编号 (如: Ⅰ-001_01_522630)
    @Column(nullable = false, unique = true, length = 50, name = "official_id")
    private String officialId;

    // 项目名称
    @Column(nullable = false)
    private String name;

    // 类别 (民间文学、传统音乐等)
    @Column(length = 100)
    private String category;

    // 地区
    @Column(length = 255)
    private String location;

    // 详细描述
    @Column(columnDefinition = "TEXT")
    private String description;

    // 批次 (如: 2006(第一批))
    @Column(length = 50)
    private String batch;

    // 官方网址
    @Column(columnDefinition = "TEXT", name = "official_url")
    private String officialUrl;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOfficialId() {
        return officialId;
    }

    public void setOfficialId(String officialId) {
        this.officialId = officialId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getOfficialUrl() {
        return officialUrl;
    }

    public void setOfficialUrl(String officialUrl) {
        this.officialUrl = officialUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
