package heritage.gen.common.config;

import cn.dev33.satoken.stp.StpInterface;
import heritage.gen.modules.user.model.SysUserEntity;
import heritage.gen.modules.user.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Sa-Token 权限接口实现
 * 用于获取用户的权限码和角色标识
 */
@Component
@RequiredArgsConstructor
public class StpInterfaceImpl implements StpInterface {

    private final SysUserRepository userRepository;

    /**
     * 返回指定账号 ID 所拥有的权限码集合
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        Long userId = Long.parseLong(loginId.toString());

        // 根据用户 ID 查询权限列表
        // 这里简化处理，后续可以扩展为从权限表查询
        SysUserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        List<String> permissions = new ArrayList<>();

        // 管理员拥有所有权限
        if (user.isAdmin()) {
            permissions.add("*"); // 通配符表示所有权限
        } else {
            // 普通用户权限
            permissions.add("user:view");
            permissions.add("user:edit");
        }

        return permissions;
    }

    /**
     * 返回指定账号 ID 所拥有的角色标识集合
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        Long userId = Long.parseLong(loginId.toString());

        // 根据用户 ID 查询角色列表
        SysUserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        List<String> roles = new ArrayList<>();

        // 根据用户状态判断角色
        if (user.isAdmin()) {
            roles.add("admin");
            roles.add("user");
        } else {
            roles.add("user");
        }

        return roles;
    }
}
