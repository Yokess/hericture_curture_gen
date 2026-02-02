package heritage.gen.modules.user.service;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.user.model.*;
import heritage.gen.modules.user.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * 用户认证服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final SysUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 注册结果
     */
    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        // 1. 检查用户名是否已存在
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "用户名已存在");
        }

        // 2. 检查邮箱是否已存在
        if (request.email() != null && !request.email().isBlank()
                && userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "邮箱已被注册");
        }

        // 3. 创建用户实体
        SysUserEntity user = new SysUserEntity();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setNickname(request.nickname() != null ? request.nickname() : request.username());
        user.setStatus("ACTIVE");

        // 4. 保存到数据库
        SysUserEntity savedUser = userRepository.save(user);

        log.info("用户注册成功: userId={}, username={}", savedUser.getId(), savedUser.getUsername());

        return Map.of(
                "userId", savedUser.getId(),
                "username", savedUser.getUsername(),
                "message", "注册成功");
    }

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录结果（包含 Token）
     */
    public Map<String, Object> login(LoginRequest request) {
        // 1. 查找用户
        SysUserEntity user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "用户名或密码错误"));

        // 2. 检查用户状态
        if (user.isBanned()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "账号已被封禁，请联系管理员");
        }

        if (user.getIsDeleted()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "用户不存在");
        }

        // 3. 验证密码
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "用户名或密码错误");
        }

        // 4. 登录（Sa-Token 一行代码）
        StpUtil.login(user.getId());

        // 5. 获取 Token
        String token = StpUtil.getTokenValue();

        log.info("用户登录成功: userId={}, username={}", user.getId(), user.getUsername());

        return Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername(),
                "nickname", user.getNickname() != null ? user.getNickname() : user.getUsername(),
                "isAdmin", user.isAdmin());
    }

    /**
     * 用户退出登录
     */
    public void logout() {
        Long userId = StpUtil.getLoginIdAsLong();
        StpUtil.logout();
        log.info("用户退出登录: userId={}", userId);
    }

    /**
     * 获取当前登录用户信息
     *
     * @return 用户信息
     */
    public UserDTO getCurrentUser() {
        Long userId = StpUtil.getLoginIdAsLong();
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "用户不存在"));

        return UserDTO.fromEntity(user);
    }

    /**
     * 根据用户 ID 获取用户信息
     *
     * @param userId 用户 ID
     * @return 用户信息
     */
    public UserDTO getUserById(Long userId) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "用户不存在"));

        return UserDTO.fromEntity(user);
    }

    /**
     * 更新用户信息
     *
     * @param userId    用户 ID
     * @param nickname  昵称
     * @param avatarUrl 头像 URL
     * @return 更新后的用户信息
     */
    @Transactional
    public UserDTO updateUserProfile(Long userId, String nickname, String avatarUrl) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "用户不存在"));

        if (nickname != null && !nickname.isBlank()) {
            user.setNickname(nickname);
        }

        if (avatarUrl != null && !avatarUrl.isBlank()) {
            user.setAvatarUrl(avatarUrl);
        }

        SysUserEntity updatedUser = userRepository.save(user);

        log.info("用户信息更新成功: userId={}", userId);

        return UserDTO.fromEntity(updatedUser);
    }

    /**
     * 修改密码
     *
     * @param userId      用户 ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        SysUserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "用户不存在"));

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "旧密码错误");
        }

        // 更新密码
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("用户密码修改成功: userId={}", userId);
    }
}
