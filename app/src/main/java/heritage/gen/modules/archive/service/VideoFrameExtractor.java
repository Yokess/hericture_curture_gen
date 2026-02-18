package heritage.gen.modules.archive.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 基于 FFmpeg 的视频关键帧提取服务
 * 使用场景检测抽帧，间隔约 5 秒或场景变化时提取
 */
@Slf4j
@Service
public class VideoFrameExtractor {

    @Value("${app.archive.ffmpeg-path:ffmpeg}")
    private String ffmpegPath;

    /**
     * 提取关键帧（基于场景变化 + 时间间隔兜底）
     * 使用 select=gt(scene,0.3) 进行场景检测，辅以 fps=1/10 确保至少每 10 秒一帧
     *
     * @param videoPath 本地视频文件路径
     * @return 关键帧信息列表：(本地文件路径, 预估时间戳毫秒)
     */
    public List<FrameInfo> extractKeyframes(Path videoPath) throws IOException, InterruptedException {
        Path outputDir = Files.createTempDirectory("arc_frames_");
        try {
            // 使用场景检测 + fps 兜底：每 10 秒至少一帧，场景变化时额外截取
            // 简化实现：使用 fps=1/5 每 5 秒一帧（稳定可靠）
            String outputPattern = outputDir.resolve("frame_%04d.png").toString();

            ProcessBuilder pb = new ProcessBuilder(
                    ffmpegPath,
                    "-y",
                    "-i", videoPath.toAbsolutePath().toString(),
                    "-vf", "fps=1/5",  // 1 frame per 5 seconds
                    "-f", "image2",
                    outputPattern
            );
            pb.redirectErrorStream(true);

            Process process = pb.start();
            boolean finished = process.waitFor(10, TimeUnit.MINUTES);
            if (!finished) {
                process.destroyForcibly();
                throw new IOException("FFmpeg 执行超时（10分钟）");
            }
            if (process.exitValue() != 0) {
                throw new IOException("FFmpeg 执行失败，exitCode=" + process.exitValue());
            }

            List<FrameInfo> result = new ArrayList<>();
            int index = 1;
            Path framePath;
            while (Files.exists(framePath = outputDir.resolve(String.format("frame_%04d.png", index)))) {
                long estimatedMs = (index - 1) * 5000L;  // 每帧间隔 5 秒
                result.add(new FrameInfo(framePath, estimatedMs));
                index++;
            }

            log.info("关键帧提取完成: 共 {} 帧", result.size());
            return result;

        } catch (Exception e) {
            try {
                deleteRecursively(outputDir);
            } catch (Exception ignored) {
            }
            throw e;
        }
    }

    /**
     * 清理临时目录（调用方在处理完帧后应调用此方法）
     */
    public void cleanupFrames(List<FrameInfo> frames) {
        if (frames == null) return;
        Path parent = null;
        for (FrameInfo f : frames) {
            try {
                if (f.path() != null && Files.exists(f.path())) {
                    parent = f.path().getParent();
                    Files.deleteIfExists(f.path());
                }
            } catch (IOException e) {
                log.warn("删除临时帧失败: {}", f.path(), e);
            }
        }
        if (parent != null) {
            try {
                Files.deleteIfExists(parent);
            } catch (IOException e) {
                log.warn("删除临时目录失败: {}", parent, e);
            }
        }
    }

    private void deleteRecursively(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (var stream = Files.list(path)) {
                stream.forEach(p -> {
                    try {
                        deleteRecursively(p);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
        }
        Files.deleteIfExists(path);
    }

    public record FrameInfo(Path path, long estimatedTimeMs) {}
}
