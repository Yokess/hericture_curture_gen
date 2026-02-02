package heritage.gen.modules.heritage.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.heritage.model.*;
import heritage.gen.modules.heritage.repository.IchProjectRepository;
import heritage.gen.modules.heritage.repository.IchSuccessorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 非遗项目服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HeritageProjectService {

    private final IchProjectRepository projectRepository;
    private final IchSuccessorRepository successorRepository;

    /**
     * 获取项目列表 (支持分类和地区筛选)
     *
     * @param category 类别 (可选)
     * @param location 地区 (可选)
     * @param page     页码
     * @param size     每页数量
     * @return 项目列表分页数据
     */
    public Page<ProjectListItemDTO> listProjects(
            String category,
            String location,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<IchProjectEntity> projectPage;

        if (category != null && location != null) {
            projectPage = projectRepository.findByCategoryAndLocationContaining(category, location, pageable);
        } else if (category != null) {
            projectPage = projectRepository.findByCategory(category, pageable);
        } else if (location != null) {
            projectPage = projectRepository.findByLocationContaining(location, pageable);
        } else {
            projectPage = projectRepository.findAll(pageable);
        }

        return projectPage.map(entity -> {
            Integer successorCount = successorRepository.countByProjectId(entity.getId());
            return ProjectListItemDTO.fromEntity(entity, successorCount != null ? successorCount : 0);
        });
    }

    /**
     * 搜索项目
     *
     * @param keyword 关键词
     * @param page    页码
     * @param size    每页数量
     * @return 搜索结果分页数据
     */
    public Page<ProjectListItemDTO> searchProjects(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<IchProjectEntity> projectPage = projectRepository.searchByKeyword(keyword, pageable);

        return projectPage.map(entity -> {
            Integer successorCount = successorRepository.countByProjectId(entity.getId());
            return ProjectListItemDTO.fromEntity(entity, successorCount != null ? successorCount : 0);
        });
    }

    /**
     * 获取项目详情
     *
     * @param id 项目ID
     * @return 项目详情
     */
    public ProjectDetailDTO getProjectDetail(Long id) {
        IchProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "项目不存在"));

        // 获取关联的传承人
        List<IchSuccessorEntity> successors = successorRepository.findByProjectId(id);
        List<SuccessorListItemDTO> successorDTOs = successors.stream()
                .map(s -> SuccessorListItemDTO.fromEntity(s, project.getName()))
                .collect(Collectors.toList());

        return ProjectDetailDTO.fromEntity(project, successorDTOs);
    }

    /**
     * 获取所有类别
     *
     * @return 类别列表
     */
    public List<String> getAllCategories() {
        return projectRepository.findAllCategories();
    }

    /**
     * 获取所有地区
     *
     * @return 地区列表
     */
    public List<String> getAllLocations() {
        return projectRepository.findAllLocations();
    }
}
