package heritage.gen.modules.user.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Entity
@Table(name = "sys_users", indexes = {
        @Index(name = "idx_user_username", columnList = "username", unique = true),
        @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class SysUserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 用户名（登录账号）
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    // 密码哈希值（BCrypt 加密）
    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    // 昵称（显示名称）
    @Column(length = 50)
    private String nickname;

    // 头像 URL（MinIO Object Key）
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    // 邮箱
    @Column(unique = true)
    private String email;

    // 手机号
    @Column(length = 20)
    private String phone;

    // 用户状态（ACTIVE: 正常, BANNED: 封禁）
    @Column(length = 20)
    private String status = "ACTIVE";

    // 是否是管理员
    @Column(nullable = false, name = "is_admin")
    private Boolean isAdmin = false;

    // 创建时间
    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    // 更新时间
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    // 软删除标记
    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    /**
     * 检查用户是否被封禁
     */
    public boolean isBanned() {
        return "BANNED".equals(this.status);
    }

    /**
     * 检查用户是否是管理员
     */
    public boolean isAdmin() {
        return Boolean.TRUE.equals(this.isAdmin);
    }

    /**
     * 检查用户是否启用（未被封禁）
     */
    public boolean isEnabled() {
        return "ACTIVE".equals(this.status);
    }
}
