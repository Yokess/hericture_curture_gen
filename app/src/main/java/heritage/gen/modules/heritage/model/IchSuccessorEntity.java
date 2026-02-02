package heritage.gen.modules.heritage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 传承人实体
 */
@Entity
@Table(name = "ich_successors", indexes = {
        @Index(name = "idx_successor_project", columnList = "projectId"),
        @Index(name = "idx_successor_name", columnList = "name")
})
public class IchSuccessorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 关联项目ID
    @Column(nullable = false, name = "project_id")
    private Long projectId;

    // 姓名
    @Column(length = 100)
    private String name;

    // 性别
    @Column(length = 10)
    private String gender;

    // 出生年份
    @Column(length = 20, name = "birth_year")
    private String birthYear;

    // 生平简介
    @Column(columnDefinition = "TEXT")
    private String description;

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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBirthYear() {
        return birthYear;
    }

    public void setBirthYear(String birthYear) {
        this.birthYear = birthYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
