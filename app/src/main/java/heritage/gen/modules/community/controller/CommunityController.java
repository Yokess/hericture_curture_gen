package heritage.gen.modules.community.controller;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.result.Result;
import heritage.gen.modules.community.model.*;
import heritage.gen.modules.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    public Result<Page<CommunityPostListItemDTO>> listPosts(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return Result.success(communityService.listPosts(projectId, tag, sort, page, size));
    }

    @GetMapping("/posts/{id}")
    public Result<CommunityPostDetailDTO> getPost(@PathVariable Long id) {
        Long userId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        return Result.success(communityService.getPostDetail(id, userId));
    }

    @PostMapping("/posts")
    public Result<ComPostEntity> createPost(@RequestBody CreatePostRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        boolean isAdmin = StpUtil.hasRole("admin");
        return Result.success(communityService.createPost(userId, request, isAdmin));
    }

    @PostMapping("/posts/{id}/like")
    public Result<InteractionResultDTO> toggleLike(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(communityService.toggleLike(id, userId));
    }

    @PostMapping("/posts/{id}/collect")
    public Result<InteractionResultDTO> toggleCollect(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(communityService.toggleCollect(id, userId));
    }

    @GetMapping("/posts/{id}/comments")
    public Result<List<CommunityCommentDTO>> listComments(@PathVariable Long id) {
        return Result.success(communityService.listComments(id));
    }

    @PostMapping("/posts/{id}/comments")
    public Result<CommunityCommentDTO> addComment(@PathVariable Long id, @RequestBody CreateCommentRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(communityService.addComment(id, userId, request));
    }
}

