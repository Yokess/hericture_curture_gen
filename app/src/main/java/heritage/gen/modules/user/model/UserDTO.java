package heritage.gen.modules.user.model;

import java.time.LocalDateTime;

/**
 * 用户信息 DTO
 */
public record UserDTO(
        Long id,
        String username,
        String nickname,
        String email,
        String phone,
        String avatarUrl,
        String status,
        String createdAt, // Changed type to String
        Boolean isAdmin // Added isAdmin field
) {
    /**
     * 从实体转换为 DTO
     */
    public static UserDTO fromEntity(SysUserEntity entity) {
        return new UserDTO(
                entity.getId(),
                entity.getUsername(),
                entity.getNickname(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getAvatarUrl(),
                entity.getStatus(),
                entity.getCreatedAt().toString(),
                entity.isAdmin() // 使用 isAdmin() 方法
        );
    }
}
