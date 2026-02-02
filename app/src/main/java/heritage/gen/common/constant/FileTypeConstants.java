package heritage.gen.common.constant;

import java.util.List;

/**
 * 文件类型常量
 */
public class FileTypeConstants {

    // ==================== 文件类型 ====================

    /**
     * 图片类型
     */
    public static final List<String> IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml");

    /**
     * 视频类型
     */
    public static final List<String> VIDEO_TYPES = List.of(
            "video/mp4",
            "video/mpeg",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-ms-wmv",
            "video/webm");

    /**
     * 文档类型（知识库支持）
     */
    public static final List<String> DOCUMENT_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/markdown",
            "text/x-markdown",
            "application/rtf");

    // ==================== 文件大小限制（字节） ====================

    /**
     * 图片最大大小: 10MB
     */
    public static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    /**
     * 视频最大大小: 500MB
     */
    public static final long MAX_VIDEO_SIZE = 500 * 1024 * 1024;

    /**
     * 文档最大大小: 50MB
     */
    public static final long MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;

    /**
     * 头像最大大小: 5MB
     */
    public static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;

    // ==================== 存储路径前缀 ====================

    /**
     * 用户头像存储前缀
     */
    public static final String PREFIX_AVATAR = "avatars";

    /**
     * 非遗项目图片存储前缀
     */
    public static final String PREFIX_PROJECT_IMAGE = "project-images";

    /**
     * 设计作品图片存储前缀
     */
    public static final String PREFIX_DESIGN_IMAGE = "design-images";

    /**
     * 视频文件存储前缀
     */
    public static final String PREFIX_VIDEO = "videos";

    /**
     * 知识库文件存储前缀
     */
    public static final String PREFIX_KNOWLEDGE_BASE = "knowledgebases";

    private FileTypeConstants() {
        // 工具类，禁止实例化
    }
}
