package heritage.gen.modules.archive.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Slf4j
@Service
public class VideoFrameExtractor {

    @Value("${app.archive.ffmpeg-path:ffmpeg}")
    private String ffmpegPath;

    @Value("${app.archive.frame-interval-sec:20}")
    private int frameIntervalSec;

    @Value("${app.archive.max-frames:20}")
    private int maxFrames;

    @Value("${app.archive.scene-threshold:0.3}")
    private double sceneThreshold;

    public record FrameInfo(Path path, long estimatedTimeMs) {}

    public List<FrameInfo> extractKeyframes(Path videoPath) throws IOException, InterruptedException {
        Path outputDir = Files.createTempDirectory("arc_frames_");
        try {
            // 方案 1：优先尝试场景检测
            List<FrameInfo> frames = runSceneDetectExtraction(videoPath, outputDir);

            // 方案 2：如果提取过少（<3帧），降级为固定间隔
            if (frames.size() < 3) {
                log.warn("场景检测帧数过少 ({})，切换为固定间隔模式", frames.size());
                cleanupFrames(frames);
                frames = runFixedIntervalExtraction(videoPath, outputDir);
            }

            // 结果裁剪
            return sampleFrames(frames, maxFrames);

        } catch (Exception e) {
            try { deleteRecursively(outputDir); } catch (Exception ignored) {}
            throw e;
        }
    }

    /**
     * 场景检测模式 (核心修正)
     */
    private List<FrameInfo> runSceneDetectExtraction(Path videoPath, Path outputDir) throws IOException, InterruptedException {
        String outputPattern = outputDir.resolve("scene_%04d.jpg").toString();
        // 关键滤镜：gt(scene,0.3) 且强制保留第0帧
        String filter = String.format(Locale.ROOT, "select='gt(scene,%.2f)+eq(n,0)'", sceneThreshold);

        // 关键参数：-vsync vfr (只输出选中的帧)
        runFfmpeg(videoPath, "-vf", filter, "-vsync", "vfr", outputPattern);

        return collectFrames(outputDir, "scene_");
    }

    /**
     * 固定间隔模式 (核心修正)
     */
    private List<FrameInfo> runFixedIntervalExtraction(Path videoPath, Path outputDir) throws IOException, InterruptedException {
        String outputPattern = outputDir.resolve("fixed_%04d.jpg").toString();
        String filter = String.format(Locale.ROOT, "fps=1/%d", frameIntervalSec);

        runFfmpeg(videoPath, "-vf", filter, outputPattern);

        return collectFrames(outputDir, "fixed_");
    }

    /**
     * 【重点】执行 FFmpeg 并读取流，防止死锁
     */
    private void runFfmpeg(Path input, String... args) throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add(ffmpegPath);
        command.add("-y");              // 覆盖输出
        command.add("-loglevel");       // 降低日志级别
        command.add("error");           // 只打印错误信息
        command.add("-i");
        command.add(input.toAbsolutePath().toString());
        command.addAll(List.of(args));  // 添加滤镜和输出路径

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // 将错误流合并到标准输出

        Process process = pb.start();

        // --- 修复死锁的关键代码 START ---
        // 必须启动一个线程或者在当前线程读取 InputStream，直到流结束
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // 如果需要调试，可以在这里打印日志
                // log.debug("FFmpeg: {}", line);
            }
        }
        // --- 修复死锁的关键代码 END ---

        boolean finished = process.waitFor(10, TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            throw new IOException("FFmpeg 执行超时（10分钟）- 可能死锁或文件过大");
        }
        if (process.exitValue() != 0) {
            throw new IOException("FFmpeg 执行失败，ExitCode=" + process.exitValue());
        }
    }

    // --- 辅助方法保持不变 ---

    private List<FrameInfo> collectFrames(Path dir, String prefix) throws IOException {
        try (Stream<Path> stream = Files.list(dir)) {
            List<Path> files = stream
                    .filter(p -> p.getFileName().toString().startsWith(prefix) && p.toString().endsWith(".jpg"))
                    .sorted(Comparator.comparing(Path::getFileName))
                    .toList();
            List<FrameInfo> infos = new ArrayList<>();
            for (int i = 0; i < files.size(); i++) {
                // 仅做粗略时间估算
                infos.add(new FrameInfo(files.get(i), (long) i * frameIntervalSec * 1000));
            }
            return infos;
        }
    }

    private List<FrameInfo> sampleFrames(List<FrameInfo> frames, int maxCount) throws IOException {
        if (frames.size() <= maxCount) return frames;
        List<FrameInfo> sampled = new ArrayList<>();
        double step = (double) (frames.size() - 1) / (maxCount - 1);
        for (int i = 0; i < maxCount; i++) {
            int idx = (int) Math.round(i * step);
            if (idx >= frames.size()) idx = frames.size() - 1;
            sampled.add(frames.get(idx));
        }
        for (FrameInfo f : frames) {
            if (!sampled.contains(f)) Files.deleteIfExists(f.path());
        }
        return sampled;
    }

    public void cleanupFrames(List<FrameInfo> frames) {
        if (frames == null) return;
        Path parent = null;
        for (FrameInfo f : frames) {
            try {
                Files.deleteIfExists(f.path());
                if (parent == null) parent = f.path().getParent();
            } catch (Exception ignored) {}
        }
        if (parent != null) {
            try { Files.deleteIfExists(parent); } catch (Exception ignored) {}
        }
    }

    private void deleteRecursively(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (Stream<Path> stream = Files.list(path)) {
                stream.forEach(p -> {
                    try { deleteRecursively(p); } catch (IOException e) { throw new RuntimeException(e); }
                });
            }
        }
        Files.deleteIfExists(path);
    }
}