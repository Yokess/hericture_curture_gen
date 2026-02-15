package heritage.gen.modules.design.controller;

import heritage.gen.common.result.Result;
import heritage.gen.modules.design.model.ArtifactEntity;
import heritage.gen.modules.design.model.DesignProject;
import heritage.gen.modules.design.model.GenerateDesignRequest;
import heritage.gen.modules.design.model.SaveDesignRequest;
import heritage.gen.modules.design.service.AiDesignService;
import heritage.gen.modules.design.service.ArtifactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/design")
@RequiredArgsConstructor
public class DesignController {

    private final AiDesignService designService;
    private final ArtifactService artifactService;

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
        log.info("收到保存设计请求: userId={}, designName={}", request.getUserId(), request.getProject().getConceptName());
        ArtifactEntity saved = artifactService.saveDesign(request.getUserId(), request.getProject(), request.getUserIdea());
        return Result.success(saved);
    }

    @GetMapping("/user/{userId}")
    public Result<List<DesignProject>> getUserDesigns(@PathVariable Long userId) {
        log.info("获取用户设计列表: userId={}", userId);
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
    public Result<ArtifactEntity> publishDesign(@PathVariable Long id, @RequestParam Long userId) {
        log.info("发布设计: id={}, userId={}", id, userId);
        ArtifactEntity published = artifactService.publishDesign(id, userId);
        return Result.success(published);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDesign(@PathVariable Long id, @RequestParam Long userId) {
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
}
