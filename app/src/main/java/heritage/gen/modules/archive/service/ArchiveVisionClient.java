package heritage.gen.modules.archive.service;

import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.common.Role;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * DashScope 多模态视觉理解客户端
 * 用于工序图片分析（调用 qwen-vl / qwen2-vl 等视觉模型）
 */
@Slf4j
@Component
public class ArchiveVisionClient {

    @Value("${dashscope.api-key}")
    private String apiKey;

    @Value("${app.archive.vision-model:qwen2-vl-7b-instruct}")
    private String model;

    /**
     * 分析图片并返回文本结果
     *
     * @param imagePath 图片本地路径
     * @param prompt    分析提示词
     * @return 模型返回的文本内容
     */
    public String analyzeImage(Path imagePath, String prompt) {
        try {
            String fileUri = imagePath.toUri().toString();
            Map<String, Object> imageMap = new HashMap<>();
            imageMap.put("image", fileUri);

            MultiModalMessage userMessage = MultiModalMessage.builder()
                    .role(Role.USER.getValue())
                    .content(java.util.Arrays.asList(
                            Collections.singletonMap("text", prompt),
                            imageMap
                    ))
                    .build();

            MultiModalConversationParam param = MultiModalConversationParam.builder()
                    .apiKey(apiKey)
                    .model(model)
                    .messages(Collections.singletonList(userMessage))
                    .build();

            MultiModalConversation conv = new MultiModalConversation();
            MultiModalConversationResult result = conv.call(param);

            if (result.getOutput() != null
                    && result.getOutput().getChoices() != null
                    && !result.getOutput().getChoices().isEmpty()) {

                var choice = result.getOutput().getChoices().get(0);
                if (choice.getMessage() != null && choice.getMessage().getContent() != null) {
                    for (var item : choice.getMessage().getContent()) {
                        if (item instanceof Map<?, ?> m && m.containsKey("text")) {
                            Object text = m.get("text");
                            if (text != null) {
                                return text.toString();
                            }
                        }
                    }
                }
            }
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "视觉模型未返回有效文本");

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("视觉模型调用失败: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "工序识别失败: " + e.getMessage());
        }
    }
}
