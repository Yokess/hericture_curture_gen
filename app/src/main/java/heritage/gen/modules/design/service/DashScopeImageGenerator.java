package heritage.gen.modules.design.service;

import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.exception.UploadFileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * DashScope 原生 SDK 图像生成器
 * 支持：文生图用 qwen-image-max，图生图可选 wan2.6-image
 */
@Slf4j
@Component
public class DashScopeImageGenerator {

    @Value("${dashscope.api-key}")
    private String apiKey;

    // 支持切换地域（北京 / 新加坡 / 国际）
    static {
        // 北京地域（默认）
        com.alibaba.dashscope.utils.Constants.baseHttpApiUrl = "https://dashscope.aliyuncs.com/api/v1";
        // 如果使用新加坡地域，切换为：
        // com.alibaba.dashscope.utils.Constants.baseHttpApiUrl = "https://dashscope-intl.aliyuncs.com/api/v1";
    }

    /**
     * 生成图像（支持文本生成和图生图）
     *
     * @param prompt               正向提示词
     * @param size                 尺寸，例如 "1024*1024"
     * @param negativePrompt       负面提示词
     * @param referenceImageUrl    参考图 URL（传 null 或空字符串则为纯文生图）
     * @param useWanxForImg2Img    是否在有参考图时使用 wan2.6-image（true=wan2.6，false=仍用 qwen-image-max）
     * @return 生成的图像 URL
     */
    public String generateImage(String prompt, String size, String negativePrompt,
                                String referenceImageUrl, boolean useWanxForImg2Img) {
        try {
            MultiModalConversation conv = new MultiModalConversation();

            // 决定使用哪个模型
            String model;
            boolean hasReference = referenceImageUrl != null && !referenceImageUrl.isBlank();
            if (hasReference && useWanxForImg2Img) {
                model = "wan2.6-image";
            } else {
                model = "qwen-image-max";  // 文生图 或 不想用 wan 的图生图 都用这个
            }
            log.info("图像生成调用模型: {}, 是否图生图: {}", model, hasReference);

            // 构建用户消息
            MultiModalMessage.MultiModalMessageBuilder userMessageBuilder = MultiModalMessage.builder()
                    .role(Role.USER.getValue());

            if (hasReference) {
                String localFilePath = downloadImageToTempFile(referenceImageUrl);
                Map<String, Object> imageMap = new HashMap<>();

                if (localFilePath != null) {
                    imageMap.put("image", localFilePath);
                    log.info("使用本地临时文件上传参考图: {}", localFilePath);
                } else {
                    // 回退使用原始 URL（风险：可能因长度超限失败）
                    imageMap.put("image", referenceImageUrl);
                    log.warn("本地下载失败，回退使用原始 URL（可能因签名过长失败）: {}", referenceImageUrl);
                }

                userMessageBuilder.content(Arrays.asList(
                        Collections.singletonMap("text", prompt),
                        imageMap
                ));
            } else {
                // 纯文生图
                userMessageBuilder.content(Arrays.asList(
                        Collections.singletonMap("text", prompt)
                ));
            }

            MultiModalMessage userMessage = userMessageBuilder.build();

            // 参数配置
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("watermark", false);
            parameters.put("prompt_extend", true);
            parameters.put("size", size);
            parameters.put("style", "<professional>");

            // 负面提示
            String finalNegative = negativePrompt != null && !negativePrompt.isBlank()
                    ? negativePrompt
                    : "模糊，低质量，畸形，肢体畸形，手指畸形，蜡像感，AI生成痕迹，文字，水印，logo，构图混乱，卡通，动漫风格";
            parameters.put("negative_prompt", finalNegative);

            // 根据模型和模式设置关键参数
            if (hasReference && model.equals("wan2.6-image")) {
                // wan2.6-image 图生图模式必须设置
                parameters.put("enable_interleave", false);
                parameters.put("ref_strength", 0.6f);   // 0.0~1.0，建议 0.4~0.7
                parameters.put("ref_mode", "repaint");  // repaint / style / subject 等
            } else if (!hasReference && model.equals("wan2.6-image")) {
                // wan2.6-image 纯文生图建议开启 interleave
                parameters.put("enable_interleave", true);
            }
            // qwen-image-max 不需要这些参数，也不会报错

            MultiModalConversationParam param = MultiModalConversationParam.builder()
                    .apiKey(apiKey)
                    .model(model)
                    .messages(Collections.singletonList(userMessage))
                    .parameters(parameters)
                    .build();

            MultiModalConversationResult result = conv.call(param);

            log.info("DashScope 图像生成成功: model={}, requestId={}", model, result.getRequestId());

            // 提取图像 URL
            if (result.getOutput() != null &&
                    result.getOutput().getChoices() != null &&
                    !result.getOutput().getChoices().isEmpty()) {

                var choice = result.getOutput().getChoices().get(0);
                if (choice.getMessage() != null &&
                        choice.getMessage().getContent() != null &&
                        !choice.getMessage().getContent().isEmpty()) {

                    var contentItem = choice.getMessage().getContent().get(0);
                    Object imageObj = contentItem.get("image");

                    if (imageObj instanceof String imageUrl && !imageUrl.isBlank()) {
                        log.debug("成功获取图像 URL: {}", imageUrl);
                        return imageUrl;
                    }
                }
            }

            throw new RuntimeException("DashScope 返回结果中未找到有效图像 URL");

        } catch (Exception e) {
            log.error("DashScope 图像生成异常, model={}, prompt前缀={}",
                    (referenceImageUrl != null && useWanxForImg2Img) ? "wan2.6-image" : "qwen-image-max",
                    prompt.substring(0, Math.min(50, prompt.length())), e);
            throw new RuntimeException("图像生成失败: " + e.getMessage(), e);
        }
    }

    private String downloadImageToTempFile(String imageUrl) {
        try {
            java.net.URL url = new java.net.URL(imageUrl);
            java.nio.file.Path tempFile = java.nio.file.Files.createTempFile("dashscope_ref_", ".png");

            try (java.io.InputStream in = url.openStream()) {
                java.nio.file.Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUri = tempFile.toUri().toString();
            log.info("参考图下载并转换为 file URI: {}", fileUri);
            return fileUri;

        } catch (Exception e) {
            log.error("下载参考图失败，将回退使用原始URL（风险较高）", e);
            return null;
        }
    }

    // 兼容旧方法（默认不强制用 wan2.6 做图生图）
    public String generateImage(String prompt, String size, String negativePrompt, String referenceImageUrl) {
        return generateImage(prompt, size, negativePrompt, referenceImageUrl, false);
    }

    // 纯文生图兼容
    public String generateImage(String prompt, String size, String negativePrompt) {
        return generateImage(prompt, size, negativePrompt, null, false);
    }

    // 显式指定是否用 wan2.6 做图生图的重载（推荐在 AiDesignService 中调用这个）
    public String generateImageWithWanxImg2Img(String prompt, String size, String negativePrompt, String referenceImageUrl) {
        return generateImage(prompt, size, negativePrompt, referenceImageUrl, true);
    }
}