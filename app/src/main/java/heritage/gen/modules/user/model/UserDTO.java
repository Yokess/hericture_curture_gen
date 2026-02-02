package heritage.gen.modules.user.model;

import java.time.LocalDateTime;

/**
 * 用户信息 DTO
 */
public record UserDTO(
        Long id,
        String username,
        String nickname,
        String avatarUrl,
        String email,
        String phone,
        String status,
        LocalDateTime createdAt) {
    /**
     * 从实体转换为 DTO
     */
    public static UserDTO fromEntity(SysUserEntity entity) {
        return new UserDTO(
                entity.getId(),
                entity.getUsername(),
                entity.getNickname(),
                entity.getAvatarUrl(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getStatus(),
                entity.getCreatedAt());
    }
}
