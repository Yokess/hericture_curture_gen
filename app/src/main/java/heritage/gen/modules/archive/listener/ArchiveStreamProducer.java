package heritage.gen.modules.archive.listener;

import heritage.gen.common.constant.AsyncTaskStreamConstants;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.infrastructure.redis.RedisService;
import heritage.gen.modules.archive.model.ArcVideoEntity;
import heritage.gen.modules.archive.repository.ArcVideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 视频解析任务生产者
 * 负责发送视频解析任务到 Redis Stream
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArchiveStreamProducer {

    private final RedisService redisService;
    private final ArcVideoRepository arcVideoRepository;

    /**
     * 发送视频解析任务到 Redis Stream
     *
     * @param videoId  视频记录 ID
     * @param videoKey MinIO 存储键
     */
    public void sendVideoAnalyzeTask(Long videoId, String videoKey) {
        ArcVideoEntity video = arcVideoRepository.findById(videoId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "视频记录不存在"));

        try {
            Map<String, String> message = Map.of(
                    AsyncTaskStreamConstants.FIELD_VIDEO_ID, videoId.toString(),
                    AsyncTaskStreamConstants.FIELD_VIDEO_KEY, videoKey,
                    AsyncTaskStreamConstants.FIELD_RETRY_COUNT, "0"
            );

            String messageId = redisService.streamAdd(
                    AsyncTaskStreamConstants.ARCHIVE_VIDEO_STREAM_KEY,
                    message
            );

            log.info("视频解析任务已发送到 Stream: videoId={}, messageId={}", videoId, messageId);
        } catch (Exception e) {
            log.error("发送视频解析任务失败: videoId={}, error={}", videoId, e.getMessage(), e);
            video.setAnalysisStatus("FAILED");
            video.setErrorMsg("任务入队失败: " + (e.getMessage() != null && e.getMessage().length() > 500
                    ? e.getMessage().substring(0, 500) : e.getMessage()));
            arcVideoRepository.save(video);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "视频解析任务入队失败");
        }
    }
}
