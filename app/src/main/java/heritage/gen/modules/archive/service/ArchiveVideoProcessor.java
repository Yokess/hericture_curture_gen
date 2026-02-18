package heritage.gen.modules.archive.service;

import heritage.gen.common.config.StorageConfigProperties;
import heritage.gen.infrastructure.file.FileStorageService;
import heritage.gen.modules.archive.model.ArcProcessStepEntity;
import heritage.gen.modules.archive.model.ArcVideoEntity;
import heritage.gen.modules.archive.repository.ArcProcessStepRepository;
import heritage.gen.modules.archive.repository.ArcVideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * 视频解析处理器
 * 编排：下载视频 -> FFmpeg 抽帧 -> AI 识别工序 -> 上传关键帧到 MinIO -> 写入 DB
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArchiveVideoProcessor {

    private final ArcVideoRepository arcVideoRepository;
    private final ArcProcessStepRepository arcProcessStepRepository;
    private final FileStorageService fileStorageService;
    private final VideoFrameExtractor videoFrameExtractor;
    private final ProcessStepRecognitionService processStepRecognitionService;

    /**
     * 处理视频解析任务
     *
     * @param videoId  视频记录 ID
     * @param videoKey MinIO 存储键
     */
    @Transactional
    public void process(Long videoId, String videoKey) {
        ArcVideoEntity video = arcVideoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频记录不存在: " + videoId));

        video.setAnalysisStatus("PROCESSING");
        video.setErrorMsg(null);
        arcVideoRepository.save(video);

        Path tempVideo = null;
        List<VideoFrameExtractor.FrameInfo> frames = null;

        try {
            // 1. 从 MinIO 下载视频到临时文件
            byte[] videoBytes = fileStorageService.downloadFile(videoKey);
            tempVideo = Files.createTempFile("arc_video_", ".mp4");
            Files.write(tempVideo, videoBytes);
            log.info("视频已下载到临时文件: videoId={}", videoId);

            // 2. FFmpeg 场景检测抽帧
            frames = videoFrameExtractor.extractKeyframes(tempVideo);
            if (frames.isEmpty()) {
                throw new RuntimeException("未能提取到任何关键帧");
            }

            // 3. 删除可能存在的旧工序记录
            arcProcessStepRepository.findByVideoIdOrderByStepOrder(videoId)
                    .forEach(arcProcessStepRepository::delete);

            // 4. 对每一帧调用 AI 识别，上传关键帧，写入工序表
            int order = 1;
            for (VideoFrameExtractor.FrameInfo frame : frames) {
                try {
                    var result = processStepRecognitionService.recognize(frame.path());
                    String keyframeKey = uploadKeyframe(frame.path(), videoId, order);
                    ArcProcessStepEntity step = new ArcProcessStepEntity();
                    step.setVideoId(videoId);
                    step.setStepOrder(order);
                    step.setStepName(result.stepName());
                    step.setDescription(result.description());
                    step.setKeyframeKey(keyframeKey);
                    step.setStartTimeMs(frame.estimatedTimeMs());
                    step.setEndTimeMs(frame.estimatedTimeMs() + 5000);
                    arcProcessStepRepository.save(step);
                    order++;
                } catch (Exception e) {
                    log.warn("处理第 {} 帧失败，跳过: {}", order, e.getMessage());
                }
            }

            // 5. 更新主记录为 COMPLETED
            video.setAnalysisStatus("COMPLETED");
            video.setErrorMsg(null);
            arcVideoRepository.save(video);
            log.info("视频解析完成: videoId={}, steps={}", videoId, order - 1);

        } catch (Exception e) {
            log.error("视频解析失败: videoId={}, error={}", videoId, e.getMessage(), e);
            video.setAnalysisStatus("FAILED");
            video.setErrorMsg(truncateError(e.getMessage()));
            arcVideoRepository.save(video);
            throw new RuntimeException(e);
        } finally {
            if (tempVideo != null) {
                try {
                    Files.deleteIfExists(tempVideo);
                } catch (IOException e) {
                    log.warn("删除临时视频失败: {}", tempVideo);
                }
            }
            if (frames != null) {
                videoFrameExtractor.cleanupFrames(frames);
            }
        }
    }

    private String uploadKeyframe(Path framePath, Long videoId, int order) {
        try {
            String prefix = "archive/keyframes/" + videoId + "/";
            String key = prefix + "frame_" + String.format("%04d", order) + ".png";
            byte[] bytes = Files.readAllBytes(framePath);
            fileStorageService.uploadBytes(key, bytes, "image/png");
            return key;
        } catch (Exception e) {
            log.warn("上传关键帧失败: videoId={}, order={}", videoId, order, e);
            return null;
        }
    }

    private String truncateError(String msg) {
        if (msg == null) return null;
        return msg.length() > 500 ? msg.substring(0, 500) : msg;
    }
}
