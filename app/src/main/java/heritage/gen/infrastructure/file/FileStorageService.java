package heritage.gen.infrastructure.file;

import heritage.gen.common.config.StorageConfigProperties;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 文件存储服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final S3Client s3Client;
    private final StorageConfigProperties storageConfig;

    /**
     * 上传用户头像
     */
    public FileUploadResult uploadAvatar(MultipartFile file) {
        return uploadFile(file, "avatars");
    }

    /**
     * 上传非遗项目图片
     */
    public FileUploadResult uploadProjectImage(MultipartFile file) {
        return uploadFile(file, "project-images");
    }

    /**
     * 上传设计作品图片
     */
    public FileUploadResult uploadDesignImage(MultipartFile file) {
        return uploadFile(file, "design-images");
    }

    /**
     * 上传视频文件
     */
    public FileUploadResult uploadVideo(MultipartFile file) {
        return uploadFile(file, "videos");
    }

    /**
     * 上传知识库文件
     */
    public FileUploadResult uploadKnowledgeBase(MultipartFile file) {
        return uploadFile(file, "knowledgebases");
    }

    /**
     * 删除知识库文件
     */
    public void deleteKnowledgeBase(String fileKey) {
        deleteFile(fileKey);
    }

    /**
     * 下载文件（通用方法）
     *
     * @param fileKey 文件存储键
     * @return 文件字节数组
     */
    public byte[] downloadFile(String fileKey) {
        if (!fileExists(fileKey)) {
            throw new BusinessException(ErrorCode.STORAGE_DOWNLOAD_FAILED, "文件不存在: " + fileKey);
        }

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .key(fileKey)
                    .build();
            return s3Client.getObjectAsBytes(getRequest).asByteArray();
        } catch (S3Exception e) {
            log.error("下载文件失败: {} - {}", fileKey, e.getMessage(), e);
            throw new BusinessException(ErrorCode.STORAGE_DOWNLOAD_FAILED, "文件下载失败: " + e.getMessage());
        }
    }

     /**
     * 从 URL 上传文件 (用于转存远程图片)
     *
     * @param imageUrl 远程图片 URL
     * @param prefix   存储前缀
     * @return 文件的访问 URL
     */
    public String uploadFromUrl(String imageUrl, String prefix) {
        try {
            java.net.URL url = new java.net.URL(imageUrl);
            java.net.URLConnection conn = url.openConnection();
            long contentLength = conn.getContentLengthLong();
            String contentType = conn.getContentType();
            
            // 简单的文件名提取
            String originalFilename = "remote_image.png";
            String path = url.getPath();
            if (path != null && path.length() > 0) {
                 int idx = path.lastIndexOf('/');
                 if (idx >= 0 && idx < path.length() - 1) {
                     originalFilename = path.substring(idx + 1);
                 }
            }
            // 处理一下文件名，去掉可能的 query param 干扰 (虽然 getPath 应该没有 query)
            if (originalFilename.contains("?")) {
                originalFilename = originalFilename.substring(0, originalFilename.indexOf("?"));
            }
            if (originalFilename.isEmpty()) {
                originalFilename = "image.png";
            }
            // 补后缀
            if (!originalFilename.contains(".")) {
                originalFilename += ".png";
            }

            String fileKey = generateFileKey(originalFilename, prefix);

            try (java.io.InputStream in = conn.getInputStream()) {
                 PutObjectRequest putRequest = PutObjectRequest.builder()
                        .bucket(storageConfig.getBucket())
                        .key(fileKey)
                        .contentType(contentType != null ? contentType : "image/png")
                        .contentLength(contentLength > 0 ? contentLength : null) // 如果无法获取长度，传 null 可能会有问题，但 AWS SDK 对于流式上传通常需要长度或者分块
                        .build();
                 
                 // 如果 content length 未知，需要先读取到内存或者临时文件获取大小，
                 // 这里简单处理：如果 contentLength < 0，尝试读取到 byte array
                 if (contentLength < 0) {
                     byte[] bytes = in.readAllBytes();
                     putRequest = putRequest.toBuilder().contentLength((long) bytes.length).build();
                     s3Client.putObject(putRequest, RequestBody.fromBytes(bytes));
                 } else {
                     s3Client.putObject(putRequest, RequestBody.fromInputStream(in, contentLength));
                 }
            }
            
            log.info("远程文件转存成功: {} -> {}", imageUrl, fileKey);
            return getFileUrl(fileKey);

        } catch (Exception e) {
            log.error("远程文件转存失败: {} - {}", imageUrl, e.getMessage(), e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, "远程文件转存失败: " + e.getMessage());
        }
    }

    /**
     * 通用文件上传方法
     * 
     * @param file   上传的文件
     * @param prefix 存储路径前缀
     * @return 文件上传结果
     */
    public FileUploadResult uploadFile(MultipartFile file, String prefix) {
        String originalFilename = file.getOriginalFilename();
        String fileKey = generateFileKey(originalFilename, prefix);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("文件上传成功: {} -> {}", originalFilename, fileKey);

            String storageUrl = getFileUrl(fileKey);
            return new FileUploadResult(
                    fileKey,
                    storageUrl,
                    originalFilename,
                    file.getContentType(),
                    file.getSize());
        } catch (IOException e) {
            log.error("读取上传文件失败: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, "文件读取失败");
        } catch (S3Exception e) {
            log.error("上传文件到存储服务失败: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, "文件存储失败: " + e.getMessage());
        }
    }

    /**
     * 检查文件是否存在
     */
    public boolean fileExists(String fileKey) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .key(fileKey)
                    .build();
            s3Client.headObject(headRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.warn("检查文件存在性失败: {} - {}", fileKey, e.getMessage());
            return false;
        }
    }

    /**
     * 获取文件大小（字节）
     */
    public long getFileSize(String fileKey) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .key(fileKey)
                    .build();
            return s3Client.headObject(headRequest).contentLength();
        } catch (S3Exception e) {
            log.error("获取文件大小失败: {} - {}", fileKey, e.getMessage());
            throw new BusinessException(ErrorCode.STORAGE_DOWNLOAD_FAILED, "获取文件信息失败");
        }
    }

    /**
     * 通用文件删除方法
     */
    private void deleteFile(String fileKey) {
        // 空键直接跳过
        if (fileKey == null || fileKey.isEmpty()) {
            log.debug("文件键为空，跳过删除");
            return;
        }

        // 检查文件是否存在，避免不必要的删除操作
        if (!fileExists(fileKey)) {
            log.warn("文件不存在，跳过删除: {}", fileKey);
            return;
        }

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .key(fileKey)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("文件删除成功: {}", fileKey);
        } catch (S3Exception e) {
            log.error("删除文件失败: {} - {}", fileKey, e.getMessage(), e);
            throw new BusinessException(ErrorCode.STORAGE_DELETE_FAILED, "文件删除失败: " + e.getMessage());
        }
    }

    public String getFileUrl(String fileKey) {
        return String.format("%s/%s/%s", storageConfig.getEndpoint(), storageConfig.getBucket(), fileKey);
    }

    /**
     * 确保存储桶存在
     */
    public void ensureBucketExists() {
        try {
            HeadBucketRequest headRequest = HeadBucketRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .build();
            s3Client.headBucket(headRequest);
            log.info("存储桶已存在: {}", storageConfig.getBucket());
        } catch (NoSuchBucketException e) {
            log.info("存储桶不存在，正在创建: {}", storageConfig.getBucket());
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                    .bucket(storageConfig.getBucket())
                    .build();
            s3Client.createBucket(createRequest);
            log.info("存储桶创建成功: {}", storageConfig.getBucket());
        } catch (S3Exception e) {
            log.error("检查存储桶失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 生成文件键
     */
    private String generateFileKey(String originalFilename, String prefix) {
        LocalDateTime now = LocalDateTime.now();
        String datePath = now.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String safeName = sanitizeFilename(originalFilename);
        return String.format("%s/%s/%s_%s", prefix, datePath, uuid, safeName);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null)
            return "unknown";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
