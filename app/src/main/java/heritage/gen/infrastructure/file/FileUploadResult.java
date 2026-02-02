package heritage.gen.infrastructure.file;

/**
 * 文件上传结果
 * 
 * @param storageKey       存储键（用于后续下载/删除）
 * @param storageUrl       访问URL（可直接访问）
 * @param originalFilename 原始文件名
 * @param contentType      文件MIME类型
 * @param fileSize         文件大小（字节）
 */
public record FileUploadResult(
        String storageKey,
        String storageUrl,
        String originalFilename,
        String contentType,
        Long fileSize) {
}
