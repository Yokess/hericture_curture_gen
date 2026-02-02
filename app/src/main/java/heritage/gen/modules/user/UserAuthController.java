package heritage.gen.modules.user;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.result.Result;
import heritage.gen.modules.user.model.*;
import heritage.gen.modules.user.service.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户认证 Controller
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthService authService;

    /**
     * 用户注册
     */
    @PostMapping("/api/auth/register")
    public Result<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }

    /**
     * 用户登录
     */
    @PostMapping("/api/auth/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    /**
     * 用户退出登录
     */
    @PostMapping("/api/auth/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.success();
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/api/user/profile")
    public Result<UserDTO> getProfile() {
        return Result.success(authService.getCurrentUser());
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/api/user/profile")
    public Result<UserDTO> updateProfile(@RequestBody Map<String, String> body) {
        Long userId = StpUtil.getLoginIdAsLong();
        String nickname = body.get("nickname");
        String avatarUrl = body.get("avatarUrl");
        String email = body.get("email");
        String phone = body.get("phone");
        return Result.success(authService.updateUserProfile(userId, nickname, avatarUrl, email, phone));
    }

    /**
     * 修改密码
     */
    @PutMapping("/api/user/password")
    public Result<Void> changePassword(@RequestBody Map<String, String> body) {
        Long userId = StpUtil.getLoginIdAsLong();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        authService.changePassword(userId, oldPassword, newPassword);
        return Result.success();
    }
}
