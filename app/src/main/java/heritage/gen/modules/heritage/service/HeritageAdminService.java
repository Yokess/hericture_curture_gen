package heritage.gen.modules.heritage.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.heritage.model.IchProjectEntity;
import heritage.gen.modules.heritage.model.IchSuccessorEntity;
import heritage.gen.modules.heritage.model.ProjectCategoryStatDTO;
import heritage.gen.modules.heritage.repository.IchProjectRepository;
import heritage.gen.modules.heritage.repository.IchSuccessorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeritageAdminService {

    private final IchProjectRepository projectRepository;
    private final IchSuccessorRepository successorRepository;

    // ==================== Project Management ====================

    /**
     * List projects with search and pagination
     */
    public Page<IchProjectEntity> listProjects(String keyword, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<IchProjectEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(root.get("name"), likePattern),
                        cb.like(root.get("officialId"), likePattern)));
            }

            if (StringUtils.hasText(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return projectRepository.findAll(spec, pageable);
    }

    public List<ProjectCategoryStatDTO> listProjectCategoryStats(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return projectRepository.listCategoryStats(safeLimit).stream()
                .map(x -> new ProjectCategoryStatDTO(x.getCategory(), x.getCnt()))
                .toList();
    }

    /**
     * Create project
     */
    @Transactional
    public IchProjectEntity createProject(IchProjectEntity project) {
        if (projectRepository.existsByOfficialId(project.getOfficialId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Project ID already exists: " + project.getOfficialId());
        }
        return projectRepository.save(project);
    }

    /**
     * Update project
     */
    @Transactional
    public IchProjectEntity updateProject(Long id, IchProjectEntity projectDetails) {
        IchProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Project not found"));

        // Only update officialId if changed and not existing
        if (!project.getOfficialId().equals(projectDetails.getOfficialId()) &&
                projectRepository.existsByOfficialId(projectDetails.getOfficialId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Project ID already exists: " + projectDetails.getOfficialId());
        }

        project.setName(projectDetails.getName());
        project.setOfficialId(projectDetails.getOfficialId());
        project.setCategory(projectDetails.getCategory());
        project.setLocation(projectDetails.getLocation());
        project.setBatch(projectDetails.getBatch());
        project.setDescription(projectDetails.getDescription());
        project.setOfficialUrl(projectDetails.getOfficialUrl());

        return projectRepository.save(project);
    }

    /**
     * Delete project
     */
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Project not found");
        }
        // TODO: Check for related successors or content before delete?
        // For now, let database constraints handle it or just delete
        projectRepository.deleteById(id);
    }

    // ==================== Successor Management ====================

    /**
     * List successors
     */
    public Page<IchSuccessorEntity> listSuccessors(Long projectId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<IchSuccessorEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }

            if (StringUtils.hasText(keyword)) {
                predicates.add(cb.like(root.get("name"), "%" + keyword + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return successorRepository.findAll(spec, pageable);
    }

    /**
     * Create successor
     */
    @Transactional
    public IchSuccessorEntity createSuccessor(IchSuccessorEntity successor) {
        if (!projectRepository.existsById(successor.getProjectId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Project not found with ID: " + successor.getProjectId());
        }
        return successorRepository.save(successor);
    }

    /**
     * Update successor
     */
    @Transactional
    public IchSuccessorEntity updateSuccessor(Long id, IchSuccessorEntity details) {
        IchSuccessorEntity successor = successorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Successor not found"));

        if (!previousProjectIdMatch(successor.getProjectId(), details.getProjectId())) {
            if (!projectRepository.existsById(details.getProjectId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Project not found with ID: " + details.getProjectId());
            }
        }

        successor.setName(details.getName());
        successor.setProjectId(details.getProjectId());
        successor.setGender(details.getGender());
        successor.setBirthYear(details.getBirthYear());
        successor.setDescription(details.getDescription());
        successor.setOfficialUrl(details.getOfficialUrl());

        return successorRepository.save(successor);
    }

    private boolean previousProjectIdMatch(Long oldId, Long newId) {
        return oldId != null && oldId.equals(newId);
    }

    /**
     * Delete successor
     */
    @Transactional
    public void deleteSuccessor(Long id) {
        if (!successorRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Successor not found");
        }
        successorRepository.deleteById(id);
    }
}
