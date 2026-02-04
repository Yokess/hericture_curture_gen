package heritage.gen.modules.heritage.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import heritage.gen.common.result.Result;
import heritage.gen.modules.heritage.model.IchProjectEntity;
import heritage.gen.modules.heritage.model.IchSuccessorEntity;
import heritage.gen.modules.heritage.service.HeritageAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/heritage")
@RequiredArgsConstructor
@SaCheckRole("admin") // Ensure only admins can access
public class HeritageAdminController {

    private final HeritageAdminService adminService;

    // ==================== Project API ====================

    @GetMapping("/projects")
    public Result<Page<IchProjectEntity>> listProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminService.listProjects(keyword, category, page, size));
    }

    @PostMapping("/projects")
    public Result<IchProjectEntity> createProject(@RequestBody IchProjectEntity project) {
        return Result.success(adminService.createProject(project));
    }

    @PutMapping("/projects/{id}")
    public Result<IchProjectEntity> updateProject(@PathVariable Long id, @RequestBody IchProjectEntity project) {
        return Result.success(adminService.updateProject(id, project));
    }

    @DeleteMapping("/projects/{id}")
    public Result<Void> deleteProject(@PathVariable Long id) {
        adminService.deleteProject(id);
        return Result.success();
    }

    // ==================== Successor API ====================

    @GetMapping("/successors")
    public Result<Page<IchSuccessorEntity>> listSuccessors(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminService.listSuccessors(projectId, keyword, page, size));
    }

    @PostMapping("/successors")
    public Result<IchSuccessorEntity> createSuccessor(@RequestBody IchSuccessorEntity successor) {
        return Result.success(adminService.createSuccessor(successor));
    }

    @PutMapping("/successors/{id}")
    public Result<IchSuccessorEntity> updateSuccessor(@PathVariable Long id,
            @RequestBody IchSuccessorEntity successor) {
        return Result.success(adminService.updateSuccessor(id, successor));
    }

    @DeleteMapping("/successors/{id}")
    public Result<Void> deleteSuccessor(@PathVariable Long id) {
        adminService.deleteSuccessor(id);
        return Result.success();
    }
}
