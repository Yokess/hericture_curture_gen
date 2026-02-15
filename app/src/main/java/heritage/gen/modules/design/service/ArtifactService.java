package heritage.gen.modules.design.service;

import heritage.gen.modules.design.model.ArtifactEntity;
import heritage.gen.modules.design.model.DesignConcept;
import heritage.gen.modules.design.model.DesignProject;
import heritage.gen.modules.design.repository.ArtifactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtifactService {

    private final ArtifactRepository artifactRepository;

    @Transactional
    public ArtifactEntity saveDesign(Long userId, DesignProject project, String userIdea) {
        log.info("保存设计到数据库: userId={}, designName={}", userId, project.getConceptName());

        ArtifactEntity entity = new ArtifactEntity();
        entity.setUserId(userId);
        entity.setDesignName(project.getConceptName());
        entity.setDesignConcept(project.getDesignPhilosophy());
        entity.setBlueprintUrl(project.getBlueprintUrl());
        entity.setProductShotUrl(project.getProductShotUrl());

        // 构建图片URLs数组
        List<String> imageUrls = new java.util.ArrayList<>();
        if (project.getBlueprintUrl() != null) imageUrls.add(project.getBlueprintUrl());
        if (project.getProductShotUrl() != null) imageUrls.add(project.getProductShotUrl());
        entity.setImageUrls(imageUrls.toArray(new String[0]));
        entity.setSelectedIndex(imageUrls.size() > 1 ? 1 : 0);

        // 将 DesignConcept 转换为 Map 存储
        Map<String, Object> conceptData = new HashMap<>();
        conceptData.put("conceptName", project.getConceptName());
        conceptData.put("designPhilosophy", project.getDesignPhilosophy());
        conceptData.put("culturalContext", project.getCulturalContext());
        conceptData.put("formFactor", project.getFormFactor());
        conceptData.put("dimensions", project.getDimensions());
        conceptData.put("userInteraction", project.getUserInteraction());
        conceptData.put("materials", project.getMaterials());
        conceptData.put("colors", project.getColors());
        conceptData.put("keyFeatures", project.getKeyFeatures());
        entity.setConceptData(conceptData);

        entity.setStatus("DRAFT");

        return artifactRepository.save(entity);
    }

    public List<ArtifactEntity> getUserDesigns(Long userId) {
        return artifactRepository.findByUserId(userId);
    }

    public ArtifactEntity getDesignById(Long id) {
        return artifactRepository.findByIdActive(id);
    }

    @Transactional
    public ArtifactEntity publishDesign(Long id, Long userId) {
        ArtifactEntity entity = artifactRepository.findByIdActive(id);
        if (entity == null) {
            throw new RuntimeException("设计不存在");
        }
        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作");
        }
        entity.setStatus("PUBLISHED");
        return artifactRepository.save(entity);
    }

    @Transactional
    public void deleteDesign(Long id, Long userId) {
        ArtifactEntity entity = artifactRepository.findByIdActive(id);
        if (entity == null) {
            throw new RuntimeException("设计不存在");
        }
        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作");
        }
        entity.setIsDeleted(true);
        artifactRepository.save(entity);
    }

    public List<ArtifactEntity> getPublishedDesigns() {
        return artifactRepository.findPublished();
    }

    public List<ArtifactEntity> getPopularDesigns() {
        return artifactRepository.findPopular();
    }

    public DesignProject convertToDesignProject(ArtifactEntity entity) {
        if (entity == null) return null;

        DesignProject project = new DesignProject();
        project.setId(entity.getId().toString());
        project.setConceptName(entity.getDesignName());
        project.setDesignPhilosophy(entity.getDesignConcept());
        project.setBlueprintUrl(entity.getBlueprintUrl());
        project.setProductShotUrl(entity.getProductShotUrl());

        // 从 conceptData 恢复字段
        if (entity.getConceptData() != null) {
            Map<String, Object> data = entity.getConceptData();
            project.setCulturalContext((String) data.get("culturalContext"));
            project.setFormFactor((String) data.get("formFactor"));
            project.setDimensions((String) data.get("dimensions"));
            project.setUserInteraction((String) data.get("userInteraction"));
            project.setMaterials((List<DesignConcept.Material>) data.get("materials"));
            project.setColors((List<DesignConcept.Color>) data.get("colors"));
            project.setKeyFeatures((List<String>) data.get("keyFeatures"));
        }

        return project;
    }
}
