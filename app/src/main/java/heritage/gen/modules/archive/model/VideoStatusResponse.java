package heritage.gen.modules.archive.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 视频处理状态响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoStatusResponse {

    private Long projectId;
    /**
     * 状态: PENDING, PROCESSING, COMPLETED, FAILED
     */
    private String status;
    /**
     * 失败时的错误信息
     */
    private String errorMsg;
    /**
     * 视频访问 URL（MinIO）
     */
    private String videoUrl;
    /**
     * 原始文件名
     */
    private String originalFilename;
    /**
     * 当 status=COMPLETED 时返回工序列表
     */
    private List<ProcessStepDto> steps;
}
