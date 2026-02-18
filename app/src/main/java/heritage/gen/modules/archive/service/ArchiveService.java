package heritage.gen.modules.archive.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.infrastructure.file.FileStorageService;
import heritage.gen.infrastructure.file.FileUploadResult;
import heritage.gen.modules.archive.listener.ArchiveStreamProducer;
import heritage.gen.modules.archive.model.*;
import heritage.gen.modules.archive.repository.ArcProcessStepRepository;
import heritage.gen.modules.archive.repository.ArcVideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 技艺数字化档案服务
 * 负责视频上传、状态查询、工序详情获取
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArchiveService {

    private final ArcVideoRepository arcVideoRepository;
    private final ArcProcessStepRepository arcProcessStepRepository;
    private final FileStorageService fileStorageService;
    private final ArchiveStreamProducer archiveStreamProducer;

    /**
     * 上传视频并创建解析任务
     * 1. 存储到 MinIO
     * 2. 创建 DB 记录 (Status: PENDING)
     * 3. 发送消息到 Redis Stream
     *
     * @param userId 用户 ID
     * @param file   视频文件
     * @return 视频/项目 ID，前端用于轮询
     */
    @Transactional
    public VideoUploadResponse uploadVideo(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请选择要上传的视频文件");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "仅支持视频格式上传");
        }

        // 1. 上传到 MinIO
        FileUploadResult uploadResult = fileStorageService.uploadVideo(file);
        log.info("视频已上传至 MinIO: key={}, size={}", uploadResult.storageKey(), uploadResult.fileSize());

        // 2. 创建 DB 记录
        ArcVideoEntity entity = new ArcVideoEntity();
        entity.setUserId(userId);
        entity.setOriginalFilename(uploadResult.originalFilename());
        entity.setVideoKey(uploadResult.storageKey());
        entity.setFileSize(uploadResult.fileSize());
        entity.setMimeType(uploadResult.contentType());
        entity.setAnalysisStatus("PENDING");
        entity = arcVideoRepository.save(entity);

        // 3. 发送到 Redis Stream
        archiveStreamProducer.sendVideoAnalyzeTask(entity.getId(), uploadResult.storageKey());

        log.info("视频上传成功: videoId={}, userId={}", entity.getId(), userId);
        return new VideoUploadResponse(entity.getId());
    }

    /**
     * 查询视频处理状态（前端轮询用）
     *
     * @param projectId 项目/视频 ID
     * @param userId    当前用户 ID（用于权限校验）
     */
    public VideoStatusResponse getStatus(Long projectId, Long userId) {
        ArcVideoEntity video = arcVideoRepository.findByIdActive(projectId);
        if (video == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "视频记录不存在");
        }
        if (!video.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权限查看该视频");
        }

        return buildStatusResponse(video);
    }

    /**
     * 获取视频工序详情（当 status=COMPLETED 时）
     */
    public VideoStatusResponse getProcessSteps(Long projectId, Long userId) {
        return getStatus(projectId, userId);
    }

    /**
     * 获取用户的所有视频记录列表
     */
    public List<VideoStatusResponse> listByUser(Long userId) {
        List<ArcVideoEntity> videos = arcVideoRepository.findByUserId(userId);
        return videos.stream().map(this::buildStatusResponse).collect(Collectors.toList());
    }

    private VideoStatusResponse buildStatusResponse(ArcVideoEntity video) {
        String videoUrl = video.getVideoKey() != null
                ? fileStorageService.getFileUrl(video.getVideoKey())
                : null;

        List<ProcessStepDto> steps = null;
        if ("COMPLETED".equals(video.getAnalysisStatus())) {
            steps = arcProcessStepRepository.findByVideoIdOrderByStepOrder(video.getId())
                    .stream()
                    .map(s -> ProcessStepDto.builder()
                            .id(s.getId())
                            .stepOrder(s.getStepOrder())
                            .stepName(s.getStepName())
                            .description(s.getDescription())
                            .keyframeUrl(s.getKeyframeKey() != null
                                    ? fileStorageService.getFileUrl(s.getKeyframeKey())
                                    : null)
                            .startTimeMs(s.getStartTimeMs())
                            .endTimeMs(s.getEndTimeMs())
                            .build())
                    .collect(Collectors.toList());
        }

        return VideoStatusResponse.builder()
                .projectId(video.getId())
                .status(video.getAnalysisStatus())
                .errorMsg(video.getErrorMsg())
                .videoUrl(videoUrl)
                .originalFilename(video.getOriginalFilename())
                .steps(steps)
                .build();
    }
}
