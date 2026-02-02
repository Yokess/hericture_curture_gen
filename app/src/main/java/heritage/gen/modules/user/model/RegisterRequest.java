package heritage.gen.modules.user.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 用户注册请求 DTO
 */
public record RegisterRequest(
        @NotBlank(message = "用户名不能为空") @Size(min = 3, max = 50, message = "用户名长度必须在 3-50 之间") String username,

        @NotBlank(message = "密码不能为空") @Size(min = 6, max = 50, message = "密码长度必须在 6-50 之间") String password,

        @Email(message = "邮箱格式不正确") String email,

        String nickname) {
}
