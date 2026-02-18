package heritage.gen.modules.archive.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 工序步骤 DTO，用于前端展示工艺路径图
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessStepDto {

    private Long id;
    private Integer stepOrder;
    private String stepName;
    private String description;
    /**
     * 关键帧图片访问 URL
     */
    private String keyframeUrl;
    /**
     * 视频时间点（毫秒）
     */
    private Long startTimeMs;
    private Long endTimeMs;
}
