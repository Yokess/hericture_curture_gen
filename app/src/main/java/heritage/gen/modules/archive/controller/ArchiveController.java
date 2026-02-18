package heritage.gen.modules.archive.controller;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.result.Result;
import heritage.gen.modules.archive.model.VideoStatusResponse;
import heritage.gen.modules.archive.model.VideoUploadResponse;
import heritage.gen.modules.archive.service.ArchiveService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 技艺数字化档案 API
 * F3: 视频异步解析、工序提取、工艺路径图展示
 */
@Slf4j
@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    /**
     * 1. 上传视频
     * 存储到 MinIO -> 创建记录(PENDING) -> 发送 Redis Stream 消息 -> 立即返回 projectId
     */
    @PostMapping("/video/upload")
    public Result<VideoUploadResponse> uploadVideo(@RequestParam("file") @NotNull MultipartFile file) {
        Long userId = StpUtil.getLoginIdAsLong();
        log.info("收到视频上传请求: userId={}, filename={}", userId, file.getOriginalFilename());
        VideoUploadResponse response = archiveService.uploadVideo(userId, file);
        return Result.success(response);
    }

    /**
     * 2. 查询处理状态（前端轮询，建议每 3 秒）
     * 返回 PENDING / PROCESSING / COMPLETED / FAILED
     */
    @GetMapping("/video/{projectId}/status")
    public Result<VideoStatusResponse> getStatus(@PathVariable Long projectId) {
        Long userId = StpUtil.getLoginIdAsLong();
        VideoStatusResponse response = archiveService.getStatus(projectId, userId);
        return Result.success(response);
    }

    /**
     * 3. 获取工序详情（当 status=COMPLETED 时返回完整工艺路径图数据）
     */
    @GetMapping("/video/{projectId}/steps")
    public Result<VideoStatusResponse> getProcessSteps(@PathVariable Long projectId) {
        Long userId = StpUtil.getLoginIdAsLong();
        VideoStatusResponse response = archiveService.getProcessSteps(projectId, userId);
        return Result.success(response);
    }

    /**
     * 4. 获取当前用户的视频档案列表
     */
    @GetMapping("/videos")
    public Result<List<VideoStatusResponse>> listMyVideos() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<VideoStatusResponse> list = archiveService.listByUser(userId);
        return Result.success(list);
    }
    @PostMapping("/{videoId}/retry")
    public Result<Void> retry(@PathVariable Long videoId) {
        Long userId = StpUtil.getLoginIdAsLong();
        archiveService.retryAnalysis(videoId, userId);
        return Result.success();
    }

    @DeleteMapping("/{videoId}")
    public Result<Void> delete(@PathVariable Long videoId) {
        Long userId = StpUtil.getLoginIdAsLong();
        archiveService.deleteVideo(videoId, userId);
        return Result.success();
    }
}
