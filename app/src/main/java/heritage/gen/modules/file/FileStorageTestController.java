package heritage.gen.modules.file;

import heritage.gen.common.result.Result;
import heritage.gen.infrastructure.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 文件存储测试 Controller
 * 用于测试 MinIO 连接和存储桶状态
 */
@Slf4j
@RestController
@RequestMapping("/api/files/test")
@RequiredArgsConstructor
public class FileStorageTestController {

    private final FileStorageService fileStorageService;

    /**
     * 测试存储服务连接
     * 检查存储桶是否存在，如果不存在则创建
     */
    @GetMapping("/connection")
    public Result<Map<String, Object>> testConnection() {
        try {
            fileStorageService.ensureBucketExists();

            return Result.success(Map.of(
                    "status", "connected",
                    "message", "存储服务连接成功，存储桶已就绪"));
        } catch (Exception e) {
            log.error("存储服务连接失败: {}", e.getMessage(), e);
            return Result.error("存储服务连接失败: " + e.getMessage());
        }
    }

    /**
     * 获取存储服务状态
     */
    @GetMapping("/status")
    public Result<Map<String, Object>> getStatus() {
        return Result.success(Map.of(
                "service", "MinIO (S3 Compatible)",
                "status", "running",
                "endpoints", Map.of(
                        "upload_avatar", "POST /api/files/avatar",
                        "upload_project_image", "POST /api/files/project-image",
                        "upload_design_image", "POST /api/files/design-image",
                        "upload_video", "POST /api/files/video",
                        "download", "GET /api/files/download?key={fileKey}",
                        "delete", "DELETE /api/files?key={fileKey}")));
    }
}
