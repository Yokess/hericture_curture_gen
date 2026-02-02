package heritage.gen.modules.file;

import heritage.gen.common.constant.FileTypeConstants;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.common.result.Result;
import heritage.gen.infrastructure.file.FileStorageService;
import heritage.gen.infrastructure.file.FileUploadResult;
import heritage.gen.infrastructure.file.FileValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传 Controller
 * 提供文件上传、下载、删除的 HTTP 接口
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    /**
     * 上传用户头像
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadResult> uploadAvatar(@RequestParam("file") MultipartFile file) {
        log.info("收到头像上传请求: {}, 大小: {} bytes", file.getOriginalFilename(), file.getSize());

        // 验证文件
        fileValidationService.validateFile(file, FileTypeConstants.MAX_AVATAR_SIZE, "头像");
        fileValidationService.validateContentTypeByList(
                file.getContentType(),
                FileTypeConstants.IMAGE_TYPES,
                "头像仅支持图片格式（JPG、PNG、GIF、WebP）");

        FileUploadResult result = fileStorageService.uploadAvatar(file);
        log.info("头像上传成功: {}", result.storageKey());
        return Result.success(result);
    }

    /**
     * 上传非遗项目图片
     */
    @PostMapping(value = "/project-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadResult> uploadProjectImage(@RequestParam("file") MultipartFile file) {
        log.info("收到非遗项目图片上传请求: {}, 大小: {} bytes", file.getOriginalFilename(), file.getSize());

        // 验证文件
        fileValidationService.validateFile(file, FileTypeConstants.MAX_IMAGE_SIZE, "项目图片");
        fileValidationService.validateContentTypeByList(
                file.getContentType(),
                FileTypeConstants.IMAGE_TYPES,
                "项目图片仅支持图片格式（JPG、PNG、GIF、WebP）");

        FileUploadResult result = fileStorageService.uploadProjectImage(file);
        log.info("项目图片上传成功: {}", result.storageKey());
        return Result.success(result);
    }

    /**
     * 上传设计作品图片
     */
    @PostMapping(value = "/design-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadResult> uploadDesignImage(@RequestParam("file") MultipartFile file) {
        log.info("收到设计作品图片上传请求: {}, 大小: {} bytes", file.getOriginalFilename(), file.getSize());

        // 验证文件
        fileValidationService.validateFile(file, FileTypeConstants.MAX_IMAGE_SIZE, "设计图片");
        fileValidationService.validateContentTypeByList(
                file.getContentType(),
                FileTypeConstants.IMAGE_TYPES,
                "设计图片仅支持图片格式（JPG、PNG、GIF、WebP）");

        FileUploadResult result = fileStorageService.uploadDesignImage(file);
        log.info("设计图片上传成功: {}", result.storageKey());
        return Result.success(result);
    }

    /**
     * 上传视频文件
     */
    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadResult> uploadVideo(@RequestParam("file") MultipartFile file) {
        log.info("收到视频上传请求: {}, 大小: {} bytes", file.getOriginalFilename(), file.getSize());

        // 验证文件
        fileValidationService.validateFile(file, FileTypeConstants.MAX_VIDEO_SIZE, "视频");
        fileValidationService.validateContentTypeByList(
                file.getContentType(),
                FileTypeConstants.VIDEO_TYPES,
                "视频仅支持 MP4、MPEG、MOV、AVI、WMV、WebM 格式");

        FileUploadResult result = fileStorageService.uploadVideo(file);
        log.info("视频上传成功: {}", result.storageKey());
        return Result.success(result);
    }

    /**
     * 下载文件
     * 
     * @param fileKey 文件存储键（路径格式：prefix/yyyy/MM/dd/uuid_filename）
     */
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam("key") String fileKey) {
        log.info("收到文件下载请求: {}", fileKey);

        if (fileKey == null || fileKey.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件键不能为空");
        }

        byte[] fileData = fileStorageService.downloadFile(fileKey);

        // 从 fileKey 中提取原始文件名
        String filename = extractFilename(fileKey);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileData);
    }

    /**
     * 删除文件
     * 
     * @param fileKey 文件存储键
     */
    @DeleteMapping
    public Result<Void> deleteFile(@RequestParam("key") String fileKey) {
        log.info("收到文件删除请求: {}", fileKey);

        if (fileKey == null || fileKey.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件键不能为空");
        }

        fileStorageService.deleteKnowledgeBase(fileKey);
        log.info("文件删除成功: {}", fileKey);
        return Result.success();
    }

    /**
     * 从文件键中提取原始文件名
     * 格式: prefix/yyyy/MM/dd/uuid_filename
     */
    private String extractFilename(String fileKey) {
        if (fileKey == null || !fileKey.contains("/")) {
            return "download";
        }

        String[] parts = fileKey.split("/");
        String lastPart = parts[parts.length - 1];

        // 去除 UUID 前缀
        int underscoreIndex = lastPart.indexOf('_');
        if (underscoreIndex > 0 && underscoreIndex < lastPart.length() - 1) {
            return lastPart.substring(underscoreIndex + 1);
        }

        return lastPart;
    }
}
