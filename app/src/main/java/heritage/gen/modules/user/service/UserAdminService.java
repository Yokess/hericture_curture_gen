package heritage.gen.modules.user.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.user.model.SysUserEntity;
import heritage.gen.modules.user.model.UserAdminDTO;
import heritage.gen.modules.user.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户管理 Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final SysUserRepository userRepository;

    /**
     * 获取用户列表（分页）
     */
    public Page<UserAdminDTO> listUsers(Integer page, Integer size, String keyword, Boolean enabled) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<SysUserEntity> userPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            // TODO: 实现关键词搜索（用户名、昵称、邮箱）
            userPage = userRepository.findAll(pageable);
        } else if (enabled != null) {
            // TODO: 实现按状态筛选
            userPage = userRepository.findAll(pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return userPage.map(UserAdminDTO::fromEntity);
    }

    /**
     * 启用/禁用用户
     */
    @Transactional
    public void toggleUserStatus(Long userId, Boolean enabled) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 不能禁用管理员
        if (user.isAdmin() && !enabled) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "不能禁用管理员账号");
        }

        user.setStatus(enabled ? "ACTIVE" : "BANNED");
        userRepository.save(user);

        log.info("用户状态已更新: userId={}, enabled={}", userId, enabled);
    }

    /**
     * 设置用户角色（管理员/普通用户）
     */
    @Transactional
    public void setUserRole(Long userId, Boolean isAdmin) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 设置角色：ADMIN 或 ACTIVE
        user.setStatus(isAdmin ? "ADMIN" : "ACTIVE");
        userRepository.save(user);

        log.info("用户角色已更新: userId={}, isAdmin={}", userId, isAdmin);
    }

    /**
     * 删除用户（软删除）
     */
    @Transactional
    public void deleteUser(Long userId) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 不能删除管理员
        if (user.isAdmin()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "不能删除管理员账号");
        }

        user.setIsDeleted(true);
        userRepository.save(user);

        log.info("用户已删除: userId={}", userId);
    }
}
