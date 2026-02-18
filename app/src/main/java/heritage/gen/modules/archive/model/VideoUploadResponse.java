package heritage.gen.modules.archive.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 视频上传成功响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadResponse {

    /**
     * 项目/视频记录 ID，前端用于轮询状态和获取工序详情
     */
    private Long projectId;
}
