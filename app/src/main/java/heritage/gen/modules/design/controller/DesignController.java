package heritage.gen.modules.design.controller;

import cn.dev33.satoken.stp.StpUtil;
import heritage.gen.common.result.Result;
import heritage.gen.modules.design.model.ArtifactEntity;
import heritage.gen.modules.design.model.DesignProject;
import heritage.gen.modules.design.model.GenerateDesignRequest;
import heritage.gen.modules.design.model.SaveDesignRequest;
import heritage.gen.modules.design.service.AiDesignService;
import heritage.gen.modules.design.service.ArtifactService;
import heritage.gen.modules.design.service.PdfExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestController
@RequestMapping("/api/design")
@RequiredArgsConstructor
public class DesignController {

    private final AiDesignService designService;
    private final ArtifactService artifactService;
    private final PdfExportService pdfExportService;

    @PostMapping("/generate/concept")
    public Result<DesignProject> generateConcept(@Valid @RequestBody GenerateDesignRequest request) {
        log.info("收到设计概念生成请求: {}", request.getIdea());
        return Result.success(designService.generateConceptOnly(request));
    }

    @PostMapping("/generate/blueprint")
    public Result<String> generateBlueprint(@RequestBody GenerateDesignRequest request) {
        log.info("收到草图生成请求");
        return Result.success(designService.generateBlueprintOnly(request));
    }

    @PostMapping("/generate/render")
    public Result<String> generateRender(@RequestBody GenerateDesignRequest request) {
        log.info("收到效果图生成请求");
        return Result.success(designService.generateRenderOnly(request));
    }

    @PostMapping("/generate")
    public Result<DesignProject> generateDesign(@Valid @RequestBody GenerateDesignRequest request) {
        log.info("收到设计生成请求 (Legacy): {}", request.getIdea());
        return Result.success(designService.generateDesign(request));
    }

    @PostMapping("/save")
    public Result<ArtifactEntity> saveDesign(@RequestBody SaveDesignRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        log.info("收到保存设计请求: userId={}, designName={}", userId, request.getProject().getConceptName());
        ArtifactEntity saved = artifactService.saveDesign(userId, request.getProject(), request.getUserIdea(), request.getChatHistory());
        return Result.success(saved);
    }

    @GetMapping("/list")
    public Result<List<DesignProject>> getMyDesigns() {
        Long userId = StpUtil.getLoginIdAsLong();
        log.info("获取当前用户设计列表: userId={}", userId);
        List<DesignProject> projects = artifactService.getUserDesigns(userId).stream()
                .map(artifactService::convertToDesignProject)
                .collect(Collectors.toList());
        return Result.success(projects);
    }


    @GetMapping("/{id}")
    public Result<DesignProject> getDesignById(@PathVariable Long id) {
        log.info("获取设计详情: id={}", id);
        DesignProject project = artifactService.convertToDesignProject(artifactService.getDesignById(id));
        return Result.success(project);
    }

    @PostMapping("/{id}/publish")
    public Result<ArtifactEntity> publishDesign(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        log.info("发布设计: id={}, userId={}", id, userId);
        ArtifactEntity published = artifactService.publishDesign(id, userId);
        return Result.success(published);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDesign(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        log.info("删除设计: id={}, userId={}", id, userId);
        artifactService.deleteDesign(id, userId);
        return Result.success(null);
    }

    @GetMapping("/public")
    public Result<List<DesignProject>> getPublishedDesigns() {
        log.info("获取公开设计列表");
        List<DesignProject> projects = artifactService.getPublishedDesigns().stream()
                .map(artifactService::convertToDesignProject)
                .collect(Collectors.toList());
        return Result.success(projects);
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        log.info("导出PDF: id={}", id);
        ArtifactEntity entity = artifactService.getDesignById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        // 1. 生成 PDF 二进制数据
        byte[] pdfData = pdfExportService.generateDesignPdf(entity);
        // 2. 处理文件名编码
        String rawFileName = (entity.getDesignName() != null ? entity.getDesignName() : "设计") + "_设计提案.pdf";
        String encodedFileName = "design_proposal.pdf"; // 默认兜底文件名
        try {
            // 使用 UTF-8 编码文件名，解决中文乱码和报错
            encodedFileName = URLEncoder.encode(rawFileName, StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            log.warn("文件名编码失败", e);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // 3. 设置 Content-Disposition
        // 这种写法兼容性最好：filename=编码后的名字
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName);
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfData);
    }

    @PostMapping("/generate/analysis")
    public Result<Map<String, Object>> generateAnalysis(@RequestBody GenerateDesignRequest request) {
        log.info("收到生成分析报告请求: conceptName={}", request.getConcept().getConceptName());
        
        Map<String, Object> analysis = new java.util.HashMap<>();
        
        // 生成市场分析
        Map<String, Object> marketAnalysis = designService.generateMarketAnalysis(request.getConcept());
        analysis.put("marketAnalysis", marketAnalysis);
        
        // 生成技术可行性
        Map<String, Object> technicalFeasibility = designService.generateTechnicalFeasibility(request.getConcept());
        analysis.put("technicalFeasibility", technicalFeasibility);
        
        // 生成风险评估
        Map<String, Object> riskAssessment = designService.generateRiskAssessment(request.getConcept());
        analysis.put("riskAssessment", riskAssessment);
        
        return Result.success(analysis);
    }

    @PostMapping("/{id}/analysis")
    public Result<ArtifactEntity> saveAnalysis(@PathVariable Long id, @RequestBody Map<String, Object> analysis) {
        log.info("保存分析报告: id={}", id);
        ArtifactEntity entity = artifactService.saveAnalysis(id, analysis);
        return Result.success(entity);
    }
}
