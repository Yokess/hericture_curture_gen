package heritage.gen.modules.design.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.design.model.DesignConcept;
import heritage.gen.modules.design.model.DesignProject;
import heritage.gen.modules.design.model.GenerateDesignRequest;
import heritage.gen.modules.knowledgebase.service.KnowledgeBaseVectorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AI 文创设计核心服务 (Design Agent)
 * 负责编排 RAG 检索、LLM 概念生成和图像生成（使用原生 DashScope SDK）
 */
@Slf4j
@Service
public class AiDesignService {

    private final ChatClient chatClient;
    private final KnowledgeBaseVectorService vectorService;
    private final DashScopeImageGenerator imageGenerator;

    private final PromptTemplate systemPromptTemplate;
    private final PromptTemplate userPromptTemplate;
    
    // 新增：市场分析、技术可行性、风险评估的prompt
    private final PromptTemplate marketSystemPrompt;
    private final PromptTemplate marketUserPrompt;
    private final PromptTemplate technicalSystemPrompt;
    private final PromptTemplate technicalUserPrompt;
    private final PromptTemplate riskSystemPrompt;
    private final PromptTemplate riskUserPrompt;

    private final heritage.gen.infrastructure.file.FileStorageService fileStorageService;

    public AiDesignService(
            ChatClient.Builder chatClientBuilder,
            KnowledgeBaseVectorService vectorService,
            DashScopeImageGenerator imageGenerator,
            heritage.gen.infrastructure.file.FileStorageService fileStorageService,
            @Value("classpath:prompts/design-concept-system.st") Resource systemPromptResource,
            @Value("classpath:prompts/design-concept-user.st") Resource userPromptResource,
            @Value("classpath:prompts/design-market-system.st") Resource marketSystemResource,
            @Value("classpath:prompts/design-market-user.st") Resource marketUserResource,
            @Value("classpath:prompts/design-technical-system.st") Resource technicalSystemResource,
            @Value("classpath:prompts/design-technical-user.st") Resource technicalUserResource,
            @Value("classpath:prompts/design-risk-system.st") Resource riskSystemResource,
            @Value("classpath:prompts/design-risk-user.st") Resource riskUserResource) throws IOException {
        this.chatClient = chatClientBuilder.build();
        this.vectorService = vectorService;
        this.imageGenerator = imageGenerator;
        this.fileStorageService = fileStorageService;
        this.systemPromptTemplate = new PromptTemplate(systemPromptResource.getContentAsString(StandardCharsets.UTF_8));
        this.userPromptTemplate = new PromptTemplate(userPromptResource.getContentAsString(StandardCharsets.UTF_8));
        
        this.marketSystemPrompt = new PromptTemplate(marketSystemResource.getContentAsString(StandardCharsets.UTF_8));
        this.marketUserPrompt = new PromptTemplate(marketUserResource.getContentAsString(StandardCharsets.UTF_8));
        this.technicalSystemPrompt = new PromptTemplate(technicalSystemResource.getContentAsString(StandardCharsets.UTF_8));
        this.technicalUserPrompt = new PromptTemplate(technicalUserResource.getContentAsString(StandardCharsets.UTF_8));
        this.riskSystemPrompt = new PromptTemplate(riskSystemResource.getContentAsString(StandardCharsets.UTF_8));
        this.riskUserPrompt = new PromptTemplate(riskUserResource.getContentAsString(StandardCharsets.UTF_8));
    }

    /**
     * 第一步：生成设计概念 (Concept)
     */
    public DesignProject generateConceptOnly(GenerateDesignRequest request) {
        log.info("开始生成设计概念: idea={}, useRag={}", request.getIdea(), request.getUseRag());
        try {
            // 1. RAG 检索
            String heritageContext = "";
            if (Boolean.TRUE.equals(request.getUseRag())) {
                heritageContext = retrieveHeritageContext(request.getIdea());
            }

            // 2. LLM 生成概念
            DesignConcept concept = generateConcept(request.getIdea(), heritageContext, request.getChatHistory());

            String projectId = UUID.randomUUID().toString();
            // 仅返回概念，图片字段为 null
            DesignProject project = new DesignProject(projectId, concept, null, null);
            project.syncFromConcept();
            return project;

        } catch (Exception e) {
            log.error("生成设计概念失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "概念生成失败: " + e.getMessage());
        }
    }

    /**
     * 第二步：生成设计草图 (Blueprint)
     */
    public String generateBlueprintOnly(GenerateDesignRequest request) {
        log.info("开始生成草图: conceptName={}", request.getConcept().getConceptName());
        try {
            String blueprintUrl = generateBlueprint(request.getConcept());
            // 转存到MinIO
            String storedUrl = getShortRefUrl(blueprintUrl);
            log.info("草图已转存到MinIO: {}", storedUrl);
            return storedUrl;
        } catch (Exception e) {
            log.error("生成草图失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "草图生成失败: " + e.getMessage());
        }
    }

    /**
     * 第三步：生成产品效果图 (Product Shot) - 支持图生图
     */
    public String generateRenderOnly(GenerateDesignRequest request) {
        log.info("开始生成效果图: conceptName={}, blueprintUrl={}",
                request.getConcept().getConceptName(), request.getBlueprintUrl());
        try {
            if (request.getBlueprintUrl() == null || request.getBlueprintUrl().isBlank()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "缺少 blueprintUrl");
            }

            String storedBlueprintUrl = request.getBlueprintUrl();
            if (!fileStorageService.isStoredObjectUrl(storedBlueprintUrl)) {
                storedBlueprintUrl = getShortRefUrl(storedBlueprintUrl);
            }
            if (!fileStorageService.isStoredObjectUrl(storedBlueprintUrl)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "blueprintUrl不合法");
            }

            // 如果提供了草图 URL，则使用图生图模式
            String renderUrl = generateProductShot(request.getConcept(), storedBlueprintUrl);
            // 转存到MinIO
            String storedUrl = getShortRefUrl(renderUrl);
            log.info("效果图已转存到MinIO: {}", storedUrl);
            return storedUrl;
        } catch (Exception e) {
            log.error("生成效果图失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "效果图生成失败: " + e.getMessage());
        }
    }

    // --- 保留原有的一键生成方法，但标记为过时或供测试使用 ---
    public DesignProject generateDesign(GenerateDesignRequest request) {
        // ... 原有逻辑保持不变 ...
        return generateConceptOnly(request); // 临时修改：默认只生成概念，强迫前端走分步流程
    }

    /**
     * RAG 检索：查找相关的非遗知识
     */
    private String retrieveHeritageContext(String idea) {
        log.info("正在检索非遗文化背景...");
        // 检索 top 3 相关文档，不限制知识库ID（搜索全库）
        List<Document> docs = vectorService.similaritySearch(idea, null, 3);

        if (docs.isEmpty()) {
            log.info("未找到相关非遗知识，将基于通用知识生成");
            return "（暂无特定非遗资料，请基于通用中国传统文化知识进行设计）";
        }

        String context = docs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("检索到 {} 条相关文化背景资料", docs.size());
        return context;
    }

    /**
     * LLM 生成：基于创意和背景生成结构化方案
     */
    private DesignConcept generateConcept(String idea, String context, List<Map<String, String>> chatHistory) {
        log.info("正在构思设计方案...");

        String systemPrompt = systemPromptTemplate.render();

        Map<String, Object> variables = new HashMap<>();
        variables.put("idea", idea);
        variables.put("context", context);
        
        // 构建包含历史对话的用户 Prompt
        StringBuilder userPromptBuilder = new StringBuilder();
        
        if (chatHistory != null && !chatHistory.isEmpty()) {
            userPromptBuilder.append("【历史对话上下文】\n");
            for (Map<String, String> msg : chatHistory) {
                String role = msg.get("role"); // "user" or "assistant"
                String content = msg.get("content");
                if (role != null && content != null) {
                    userPromptBuilder.append(role.toUpperCase()).append(": ").append(content).append("\n");
                }
            }
            userPromptBuilder.append("\n【当前请求】\n");
        }
        
        userPromptBuilder.append(userPromptTemplate.render(variables));
        
        String finalUserPrompt = userPromptBuilder.toString();

        return chatClient.prompt()
                .system(systemPrompt)
                .user(finalUserPrompt)
                .call()
                .entity(DesignConcept.class); // 自动解析 JSON 到对象
    }

    /**
     * 生成设计草图 (Blueprint) - 使用 qwen-image-max（纯文生图）
     */
    private String generateBlueprint(DesignConcept concept) {
        log.info("正在生成设计草图 (使用 qwen-image-max)...");
        String prompt = String.format(
                "工业设计手绘草图，技术图纸风格，主体：%s，" +
                        "设计理念：%s，外观形态：%s，包含尺寸标注和材质说明，" +
                        "线条流畅，素描风格，淡彩渲染，工程美学，高清晰度，白色背景，" +
                        "三视图（正视图、侧视图、顶视图），详细的结构分解图",
                concept.getConceptName(),
                concept.getDesignPhilosophy(),
                concept.getFormFactor()
        );
        String negativePrompt = "照片，写实，3D渲染，色彩过度饱和，模糊，混乱，低质量，水印";

        // 调用文生图（referenceImageUrl = null）
        return callImageGenerator(prompt, negativePrompt, null);
    }

    /**
     * 将远程 URL 转存到本地存储，并返回可访问的短 URL
     */
    private String getShortRefUrl(String originalUrl) {
        if (originalUrl == null || originalUrl.isBlank()) {
            return null;
        }

        log.info("开始转存参考图，原URL长度: {}", originalUrl.length());
        String shortUrl = fileStorageService.uploadFromUrl(originalUrl, "design-refs");
        log.info("参考图转存成功，新URL: {}", shortUrl);
        return shortUrl;
    }

    /**
     * 从MinIO URL下载图片到临时文件，供DashScope图生图使用
     */
    private String downloadMinioImageToTemp(String minioUrl) {
        if (minioUrl == null || minioUrl.isBlank()) {
            return null;
        }

        if (!fileStorageService.isStoredObjectUrl(minioUrl)) {
            return null;
        }

        try {
            log.info("从MinIO下载参考图: {}", minioUrl);
            Path tempFile = Files.createTempFile("minio_ref_", ".png");
            java.net.URLConnection conn = URI.create(minioUrl).toURL().openConnection();
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(15000);
            try (var in = conn.getInputStream()) {
                Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            String fileUri = tempFile.toUri().toString();
            log.info("参考图下载成功: {}", fileUri);
            return fileUri;
        } catch (Exception e) {
            log.error("从MinIO下载参考图失败", e);
            return null;
        }
    }

    /**
     * 生成产品效果图 (Product Shot) - 使用 wan2.6-image 进行图生图
     */
    private String generateProductShot(DesignConcept concept, String blueprintUrl) {
        log.info("正在生成产品效果图 (使用 wan2.6-image 图生图, 参考图: {})...",
                blueprintUrl != null ? "有" : "无");

        // 下载到临时文件供DashScope使用
        String tempFileUrl = null;
        tempFileUrl = downloadMinioImageToTemp(blueprintUrl);

        String prompt = String.format(
                "专业工业设计产品摄影，主体：%s，" +
                        "设计理念：%s，外观形态：%s，材质与工艺：%s，配色方案：%s，" +
                        "电影级光影，8K超高清，超现实主义，Octane Render，清爽纯色背景，" +
                        "获奖级工业设计作品，极致细节，商业摄影风格",
                concept.getConceptName(),
                concept.getDesignPhilosophy(),
                concept.getFormFactor(),
                concept.getMaterials().stream().map(m -> m.getName() + " " + m.getFinish()).collect(Collectors.joining("，")),
                concept.getColors().stream().map(c -> c.getName()).collect(Collectors.joining("，"))
        );
        String negativePrompt = "模糊，低质量，畸形，蜡像感，AI生成痕迹，文字，水印，构图混乱，卡通风格，手绘风格，草图线条";

        // 显式调用 generateImageWithWanxImg2Img 来使用 wan2.6-image
        // 传入临时文件URL供DashScope读取
        return callImageGeneratorWanx(prompt, negativePrompt, tempFileUrl);
    }

    // 用于草图和普通调用（默认 qwen-image-max）
    private String callImageGenerator(String prompt, String negativePrompt, String refImageUrl) {
        try {
            log.info("调用图像生成 (qwen-image-max): prompt前缀={}, ref={}",
                    prompt.substring(0, Math.min(60, prompt.length())),
                    refImageUrl != null ? "有" : "无");
            return imageGenerator.generateImage(prompt, "1024*1024", negativePrompt, refImageUrl);
        } catch (Exception e) {
            log.error("图像生成失败 (qwen-image-max)", e);
            return "https://via.placeholder.com/1024x1024?text=Image+Generation+Failed";
        }
    }

    // 专用于效果图 - 强制使用 wan2.6-image 图生图
    private String callImageGeneratorWanx(String prompt, String negativePrompt, String refImageUrl) {
        try {
            log.info("调用图像生成 (wan2.6-image 图生图): prompt前缀={}, ref={}",
                    prompt.substring(0, Math.min(60, prompt.length())),
                    refImageUrl != null ? "有" : "无");
            return imageGenerator.generateImageWithWanxImg2Img(prompt, "1024*1024", negativePrompt, refImageUrl);
        } catch (Exception e) {
            log.error("图像生成失败 (wan2.6-image)", e);
            return "https://via.placeholder.com/1024x1024?text=Image+Generation+Failed";
        }
    }

    // 兼容旧调用方式（默认不强制 wan）
    private String callImageGenerator(String prompt, String negativePrompt) {
        return callImageGenerator(prompt, negativePrompt, null);
    }

    /**
     * 生成市场分析报告
     */
    public Map<String, Object> generateMarketAnalysis(DesignConcept concept) {
        log.info("生成市场分析报告: {}", concept.getConceptName());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("conceptName", concept.getConceptName());
            variables.put("designPhilosophy", concept.getDesignPhilosophy());
            variables.put("materials", concept.getMaterials().stream()
                    .map(m -> m.getName() + " " + m.getFinish())
                    .collect(Collectors.joining(", ")));
            variables.put("keyFeatures", concept.getKeyFeatures().stream()
                    .collect(Collectors.joining(", ")));
            
            String userPrompt = marketUserPrompt.render(variables);
            
            String result = chatClient.prompt()
                    .system(marketSystemPrompt.render())
                    .user(userPrompt)
                    .call()
                    .content();
            
            return parseJsonToMap(result);
        } catch (Exception e) {
            log.error("市场分析生成失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "市场分析生成失败: " + e.getMessage());
        }
    }

    /**
     * 生成技术可行性报告
     */
    public Map<String, Object> generateTechnicalFeasibility(DesignConcept concept) {
        log.info("生成技术可行性报告: {}", concept.getConceptName());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("conceptName", concept.getConceptName());
            variables.put("formFactor", concept.getFormFactor());
            variables.put("dimensions", concept.getDimensions());
            variables.put("materials", concept.getMaterials().stream()
                    .map(m -> m.getName() + " - " + m.getFinish())
                    .collect(Collectors.joining(", ")));
            variables.put("keyFeatures", concept.getKeyFeatures().stream()
                    .collect(Collectors.joining(", ")));
            
            String userPrompt = technicalUserPrompt.render(variables);
            
            String result = chatClient.prompt()
                    .system(technicalSystemPrompt.render())
                    .user(userPrompt)
                    .call()
                    .content();
            
            return parseJsonToMap(result);
        } catch (Exception e) {
            log.error("技术可行性生成失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "技术可行性生成失败: " + e.getMessage());
        }
    }

    /**
     * 生成风险评估报告
     */
    public Map<String, Object> generateRiskAssessment(DesignConcept concept) {
        log.info("生成风险评估报告: {}", concept.getConceptName());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("conceptName", concept.getConceptName());
            variables.put("materials", concept.getMaterials().stream()
                    .map(m -> m.getName() + " " + m.getFinish())
                    .collect(Collectors.joining(", ")));
            variables.put("userInteraction", concept.getUserInteraction());
            variables.put("keyFeatures", concept.getKeyFeatures().stream()
                    .collect(Collectors.joining(", ")));
            
            String userPrompt = riskUserPrompt.render(variables);
            
            String result = chatClient.prompt()
                    .system(riskSystemPrompt.render())
                    .user(userPrompt)
                    .call()
                    .content();
            
            return parseJsonToMap(result);
        } catch (Exception e) {
            log.error("风险评估生成失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "风险评估生成失败: " + e.getMessage());
        }
    }

    /**
     * 解析JSON字符串为Map
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonToMap(String jsonStr) {
        try {
            jsonStr = jsonStr.trim();
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.substring(7);
            }
            if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
            }
            jsonStr = jsonStr.trim();
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(jsonStr, Map.class);
        } catch (Exception e) {
            log.error("JSON解析失败: {}", jsonStr, e);
            return new HashMap<>();
        }
    }
}
