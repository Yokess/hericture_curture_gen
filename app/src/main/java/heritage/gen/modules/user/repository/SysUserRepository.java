package heritage.gen.modules.user.repository;

import heritage.gen.modules.user.model.SysUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 用户 Repository
 */
public interface SysUserRepository extends JpaRepository<SysUserEntity, Long> {

    /**
     * 根据用户名查找用户
     */
    Optional<SysUserEntity> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<SysUserEntity> findByEmail(String email);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);
}
