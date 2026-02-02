package heritage.gen.modules.heritage.controller;

import heritage.gen.common.result.Result;
import heritage.gen.modules.heritage.model.ProjectDetailDTO;
import heritage.gen.modules.heritage.model.ProjectListItemDTO;
import heritage.gen.modules.heritage.service.HeritageProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 非遗项目和传承人控制器
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/heritage")
public class HeritageController {

    private final HeritageProjectService projectService;

    /**
     * 获取项目列表
     *
     * @param category 类别 (可选)
     * @param location 地区 (可选)
     * @param page     页码 (从0开始)
     * @param size     每页数量
     * @return 项目列表分页数据
     */
    @GetMapping("/projects")
    public Result<Page<ProjectListItemDTO>> listProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        log.info("获取项目列表: category={}, location={}, page={}, size={}", category, location, page, size);
        return Result.success(projectService.listProjects(category, location, page, size));
    }

    /**
     * 搜索项目
     *
     * @param keyword 关键词
     * @param page    页码
     * @param size    每页数量
     * @return 搜索结果分页数据
     */
    @GetMapping("/projects/search")
    public Result<Page<ProjectListItemDTO>> searchProjects(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        log.info("搜索项目: keyword={}, page={}, size={}", keyword, page, size);
        return Result.success(projectService.searchProjects(keyword, page, size));
    }

    /**
     * 获取项目详情
     *
     * @param id 项目ID
     * @return 项目详情
     */
    @GetMapping("/projects/{id}")
    public Result<ProjectDetailDTO> getProjectDetail(@PathVariable Long id) {
        log.info("获取项目详情: id={}", id);
        return Result.success(projectService.getProjectDetail(id));
    }

    /**
     * 获取所有类别
     *
     * @return 类别列表
     */
    @GetMapping("/categories")
    public Result<List<String>> getAllCategories() {
        log.info("获取所有类别");
        return Result.success(projectService.getAllCategories());
    }

    /**
     * 获取所有地区
     *
     * @return 地区列表
     */
    @GetMapping("/locations")
    public Result<List<String>> getAllLocations() {
        log.info("获取所有地区");
        return Result.success(projectService.getAllLocations());
    }
}
