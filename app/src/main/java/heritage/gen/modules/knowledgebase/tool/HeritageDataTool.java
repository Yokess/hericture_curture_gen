package heritage.gen.modules.knowledgebase.tool;

import heritage.gen.modules.heritage.model.IchProjectEntity;
import heritage.gen.modules.heritage.model.IchSuccessorEntity;
import heritage.gen.modules.heritage.repository.IchProjectRepository;
import heritage.gen.modules.heritage.repository.IchSuccessorRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 非遗数据库查询工具
 * 为 AI 提供查询非遗项目和传承人的能力
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HeritageDataTool {

    private final IchProjectRepository projectRepository;
    private final IchSuccessorRepository successorRepository;

    /**
     * 查询非遗项目工具
     */
    @Tool(description = "查询非遗项目信息。当用户询问具体的非遗项目、项目特色、项目详情时使用此工具。支持按关键词、类别、地区查询。")
    public ProjectQueryResponse queryProjects(String keyword, String category, String location, Integer limit) {
        log.info("AI 调用工具: queryProjects, keyword={}, category={}, location={}, limit={}",
                keyword, category, location, limit);

        try {
            List<IchProjectEntity> projects;
            int resultLimit = limit != null ? limit : 5;

            if (keyword != null && !keyword.isBlank()) {
                projects = projectRepository.searchByKeyword(keyword, PageRequest.of(0, resultLimit)).getContent();
            } else if (category != null && !category.isBlank()) {
                projects = projectRepository.findByCategory(category, PageRequest.of(0, resultLimit)).getContent();
            } else if (location != null && !location.isBlank()) {
                projects = projectRepository.findByLocationContaining(location, PageRequest.of(0, resultLimit)).getContent();
            } else {
                projects = projectRepository.findAll(PageRequest.of(0, resultLimit)).getContent();
            }

            List<ProjectInfo> projectInfos = projects.stream()
                .map(p -> new ProjectInfo(p.getId(), p.getName(), p.getCategory(),
                        p.getLocation(), p.getDescription(), p.getBatch()))
                .collect(Collectors.toList());

            return new ProjectQueryResponse(projectInfos, projectInfos.size());
        } catch (Exception e) {
            log.error("查询项目失败", e);
            return new ProjectQueryResponse(List.of(), 0);
        }
    }

    /**
     * 查询传承人工具
     */
    @Tool(description = "查询非遗传承人信息。当用户询问某个项目的传承人、传承人是谁、传承人详情时使用此工具。支持按项目ID或传承人姓名查询。")
    public SuccessorQueryResponse querySuccessors(Long projectId, String name, Integer limit) {
        log.info("AI 调用工具: querySuccessors, projectId={}, name={}, limit={}",
                projectId, name, limit);

        try {
            List<IchSuccessorEntity> successors;
            int resultLimit = limit != null ? limit : 10;

            if (projectId != null) {
                successors = successorRepository.findByProjectId(projectId, PageRequest.of(0, resultLimit)).getContent();
            } else if (name != null && !name.isBlank()) {
                successors = successorRepository.findByNameContaining(name, PageRequest.of(0, resultLimit)).getContent();
            } else {
                successors = successorRepository.findAll(PageRequest.of(0, resultLimit)).getContent();
            }

            List<SuccessorInfo> successorInfos = successors.stream()
                .map(s -> {
                    String projectName = projectRepository.findById(s.getProjectId())
                            .map(IchProjectEntity::getName)
                            .orElse("未知项目");
                    return new SuccessorInfo(s.getId(), s.getName(), s.getGender(),
                            s.getBirthYear(), s.getDescription(), s.getProjectId(), projectName);
                })
                .collect(Collectors.toList());

            return new SuccessorQueryResponse(successorInfos, successorInfos.size());
        } catch (Exception e) {
            log.error("查询传承人失败", e);
            return new SuccessorQueryResponse(List.of(), 0);
        }
    }

    // DTO 类定义
    @Data
    public static class ProjectInfo {
        private final Long id;
        private final String name;
        private final String category;
        private final String location;
        private final String description;
        private final String batch;
    }

    @Data
    public static class ProjectQueryResponse {
        private final List<ProjectInfo> projects;
        private final int total;
    }

    @Data
    public static class SuccessorInfo {
        private final Long id;
        private final String name;
        private final String gender;
        private final String birthYear;
        private final String description;
        private final Long projectId;
        private final String projectName;
    }

    @Data
    public static class SuccessorQueryResponse {
        private final List<SuccessorInfo> successors;
        private final int total;
    }
}
