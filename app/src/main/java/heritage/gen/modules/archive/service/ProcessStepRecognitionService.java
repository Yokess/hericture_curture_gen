package heritage.gen.modules.archive.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 基于视觉大模型的工序识别服务
 * 调用 DashScope 多模态 API（qwen-vl）识别图片中的非遗工艺工序
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessStepRecognitionService {

    private final ArchiveVisionClient visionClient;
    private final ObjectMapper objectMapper;

    /**
     * 识别单张关键帧图片中的工序信息
     *
     * @param imagePath 图片本地路径
     * @return stepName, description
     */
    public StepRecognitionResult recognize(Path imagePath) {
        String prompt = """
            这是一张非遗技艺教学视频中的关键帧截图。请识别图中展示的工艺工序步骤，输出严格的 JSON 格式：
            {"stepName":"工序名称，如：构图、剪样、刻画、上色等","description":"简要描述该步骤的操作要点和画面内容"}
            只输出 JSON，不要其他文字。
            """;

        String rawResponse = visionClient.analyzeImage(imagePath, prompt);

        return parseResponse(rawResponse);
    }

    private StepRecognitionResult parseResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return new StepRecognitionResult("未知工序", "未能识别");
        }
        String json = extractJson(raw);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            String stepName = getString(map, "stepName", "未知工序");
            String description = getString(map, "description", "");
            return new StepRecognitionResult(stepName, description);
        } catch (Exception e) {
            log.warn("解析工序 JSON 失败，使用默认值: {}", raw, e);
            return new StepRecognitionResult("工艺步骤", raw.length() > 200 ? raw.substring(0, 200) : raw);
        }
    }

    private String extractJson(String raw) {
        String s = raw.trim();
        // 去除 markdown 代码块
        if (s.startsWith("```json")) s = s.substring(7);
        else if (s.startsWith("```")) s = s.substring(3);
        if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        s = s.trim();

        // 尝试提取 {...}
        Pattern p = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
        Matcher m = p.matcher(s);
        if (m.find()) {
            return m.group();
        }
        return "{}";
    }

    private String getString(Map<String, Object> map, String key, String defaultVal) {
        Object v = map.get(key);
        if (v == null) return defaultVal;
        return String.valueOf(v).trim();
    }

    public record StepRecognitionResult(String stepName, String description) {}
}
