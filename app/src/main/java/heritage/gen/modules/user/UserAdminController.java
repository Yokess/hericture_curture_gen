package heritage.gen.modules.user;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.common.result.Result;
import heritage.gen.modules.user.model.UserAdminDTO;
import heritage.gen.modules.user.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户管理 Controller（管理员功能）
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public Result<Page<UserAdminDTO>> listUsers(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean enabled) {

        // 检查管理员权限
        checkAdminPermission();

        Page<UserAdminDTO> users = userAdminService.listUsers(page, size, keyword, enabled);
        return Result.success(users);
    }

    /**
     * 启用/禁用用户
     */
    @PutMapping("/users/{userId}/status")
    public Result<Void> toggleUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body) {

        checkAdminPermission();

        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "缺少 enabled 参数");
        }

        userAdminService.toggleUserStatus(userId, enabled);
        return Result.success();
    }

    /**
     * 设置用户角色
     */
    @PutMapping("/users/{userId}/role")
    public Result<Void> setUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body) {

        checkAdminPermission();

        Boolean isAdmin = body.get("isAdmin");
        if (isAdmin == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "缺少 isAdmin 参数");
        }

        userAdminService.setUserRole(userId, isAdmin);
        return Result.success();
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/users/{userId}")
    public Result<Void> deleteUser(@PathVariable Long userId) {
        checkAdminPermission();

        userAdminService.deleteUser(userId);
        return Result.success();
    }

    /**
     * 检查管理员权限
     */
    private void checkAdminPermission() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "请先登录");
        }

        // TODO: 实现更严格的管理员权限检查
        // 目前简单检查是否登录
    }
}
