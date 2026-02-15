package heritage.gen.modules.design.controller;

import heritage.gen.common.result.Result;
import heritage.gen.modules.design.model.DesignProject;
import heritage.gen.modules.design.model.GenerateDesignRequest;
import heritage.gen.modules.design.service.AiDesignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * AI 文创设计控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/design")
@RequiredArgsConstructor
public class DesignController {

    private final AiDesignService designService;

    /**
     * 第一步：生成设计概念
     */
    @PostMapping("/generate/concept")
    public Result<DesignProject> generateConcept(@Valid @RequestBody GenerateDesignRequest request) {
        log.info("收到设计概念生成请求: {}", request.getIdea());
        return Result.success(designService.generateConceptOnly(request));
    }

    /**
     * 第二步：生成草图 (Blueprint)
     */
    @PostMapping("/generate/blueprint")
    public Result<String> generateBlueprint(@RequestBody GenerateDesignRequest request) {
        log.info("收到草图生成请求");
        return Result.success(designService.generateBlueprintOnly(request));
    }

    /**
     * 第三步：生成效果图 (Render) - 支持基于草图生成
     */
    @PostMapping("/generate/render")
    public Result<String> generateRender(@RequestBody GenerateDesignRequest request) {
        log.info("收到效果图生成请求");
        return Result.success(designService.generateRenderOnly(request));
    }

    /**
     * 一键生成 (保留兼容性)
     */
    @PostMapping("/generate")
    public Result<DesignProject> generateDesign(@Valid @RequestBody GenerateDesignRequest request) {
        log.info("收到设计生成请求 (Legacy): {}", request.getIdea());
        return Result.success(designService.generateDesign(request));
    }
}
