package heritage.gen.modules.community.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import heritage.gen.common.result.Result;
import heritage.gen.modules.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/community")
@RequiredArgsConstructor
@SaCheckRole("admin")
public class CommunityAdminController {

    private final CommunityService communityService;

    @PostMapping("/posts/{id}/pin")
    public Result<Void> pin(@PathVariable Long id, @RequestParam boolean pinned) {
        communityService.setPinned(id, pinned);
        return Result.success(null);
    }

    @DeleteMapping("/posts/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        communityService.deletePost(id);
        return Result.success(null);
    }
}

