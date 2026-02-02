package heritage.gen.modules.user.model;

import java.time.LocalDateTime;

/**
 * 用户管理 DTO
 */
public record UserAdminDTO(
        Long id,
        String username,
        String nickname,
        String email,
        String phone,
        String avatarUrl,
        Boolean isAdmin,
        Boolean enabled,
        String status,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt) {
    /**
     * 从 Entity 转换为 DTO
     */
    public static UserAdminDTO fromEntity(SysUserEntity entity) {
        return new UserAdminDTO(
                entity.getId(),
                entity.getUsername(),
                entity.getNickname(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getAvatarUrl(),
                entity.isAdmin(),
                "ACTIVE".equals(entity.getStatus()),
                entity.getStatus(),
                entity.getCreatedAt(),
                null // TODO: 添加最后登录时间字段
        );
    }
}
