package heritage.gen.modules.archive.listener;

import heritage.gen.common.constant.AsyncTaskStreamConstants;
import heritage.gen.infrastructure.redis.RedisService;
import heritage.gen.modules.archive.service.ArchiveVideoProcessor;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.stream.StreamMessageId;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 视频解析 Stream 消费者
 * 消费 Redis Stream 消息，执行 FFmpeg 抽帧 + 视觉大模型工序识别
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArchiveStreamConsumer {

    private final RedisService redisService;
    private final ArchiveVideoProcessor archiveVideoProcessor;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private ExecutorService executorService;
    private String consumerName;

    @PostConstruct
    public void init() {
        this.consumerName = AsyncTaskStreamConstants.ARCHIVE_VIDEO_CONSUMER_PREFIX
                + UUID.randomUUID().toString().substring(0, 8);

        try {
            redisService.createStreamGroup(
                    AsyncTaskStreamConstants.ARCHIVE_VIDEO_STREAM_KEY,
                    AsyncTaskStreamConstants.ARCHIVE_VIDEO_GROUP_NAME
            );
            log.info("视频解析 Stream 消费者组已创建或已存在: {}", AsyncTaskStreamConstants.ARCHIVE_VIDEO_GROUP_NAME);
        } catch (Exception e) {
            log.warn("创建消费者组时发生异常（可能已存在）: {}", e.getMessage());
        }

        this.executorService = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "archive-video-consumer");
            t.setDaemon(true);
            return t;
        });

        running.set(true);
        executorService.submit(this::consumeLoop);

        log.info("视频解析消费者已启动: consumerName={}", consumerName);
    }

    @PreDestroy
    public void shutdown() {
        running.set(false);
        if (executorService != null) {
            executorService.shutdown();
        }
        log.info("视频解析消费者已关闭: consumerName={}", consumerName);
    }

    private void consumeLoop() {
        while (running.get()) {
            try {
                redisService.streamConsumeMessages(
                        AsyncTaskStreamConstants.ARCHIVE_VIDEO_STREAM_KEY,
                        AsyncTaskStreamConstants.ARCHIVE_VIDEO_GROUP_NAME,
                        consumerName,
                        AsyncTaskStreamConstants.BATCH_SIZE,
                        AsyncTaskStreamConstants.POLL_INTERVAL_MS,
                        this::processMessage
                );
            } catch (Exception e) {
                if (Thread.currentThread().isInterrupted()) {
                    log.info("消费者线程被中断");
                    break;
                }
                log.error("消费视频解析消息时发生错误: {}", e.getMessage(), e);
            }
        }
    }

    private void processMessage(StreamMessageId messageId, Map<String, String> data) {
        String videoIdStr = data.get(AsyncTaskStreamConstants.FIELD_VIDEO_ID);
        String videoKey = data.get(AsyncTaskStreamConstants.FIELD_VIDEO_KEY);

        if (videoIdStr == null || videoKey == null) {
            log.warn("消息格式错误，跳过: messageId={}", messageId);
            ackMessage(messageId);
            return;
        }

        Long videoId = Long.parseLong(videoIdStr);

        log.info("开始处理视频解析任务: videoId={}, messageId={}", videoId, messageId);

        try {
            archiveVideoProcessor.process(videoId, videoKey);
            ackMessage(messageId);
            log.info("视频解析任务完成: videoId={}", videoId);
        } catch (Exception e) {
            log.error("视频解析任务失败: videoId={}, error={}", videoId, e.getMessage(), e);
            ackMessage(messageId);
        }
    }

    private void ackMessage(StreamMessageId messageId) {
        try {
            redisService.streamAck(
                    AsyncTaskStreamConstants.ARCHIVE_VIDEO_STREAM_KEY,
                    AsyncTaskStreamConstants.ARCHIVE_VIDEO_GROUP_NAME,
                    messageId
            );
        } catch (Exception e) {
            log.error("确认消息失败: messageId={}, error={}", messageId, e.getMessage(), e);
        }
    }
}
