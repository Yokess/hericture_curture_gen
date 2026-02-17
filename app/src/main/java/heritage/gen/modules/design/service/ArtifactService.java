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
    public ArtifactEntity saveDesign(Long userId, DesignProject project, String userIdea, java.util.List<java.util.Map<String, String>> chatHistory) {
        ArtifactEntity entity = null;
        
        // 如果是更新现有设计
        if (project.getId() != null && !project.getId().isBlank()) {
            try {
                Long id = Long.parseLong(project.getId());
                entity = artifactRepository.findById(id).orElse(null);
            } catch (NumberFormatException e) {
                // 新设计，忽略 ID
            }
        }
        
        if (entity == null) {
            entity = new ArtifactEntity();
        }

        entity.setUserId(userId);
        entity.setDesignName(project.getConceptName());
        entity.setDesignConcept(project.getDesignPhilosophy());
        entity.setBlueprintUrl(project.getBlueprintUrl());
        entity.setProductShotUrl(project.getProductShotUrl());
        entity.setStatus("COMPLETED");
        
        // 构建图片URLs数组
        List<String> imageUrls = new java.util.ArrayList<>();
        if (project.getBlueprintUrl() != null) imageUrls.add(project.getBlueprintUrl());
        if (project.getProductShotUrl() != null) imageUrls.add(project.getProductShotUrl());
        entity.setImageUrls(imageUrls.toArray(new String[0]));
        entity.setSelectedIndex(imageUrls.size() > 1 ? 1 : 0);
        
        // 保存设计数据
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
        
        // 保存元数据
        if (entity.getGenerationMetadata() == null) {
            entity.setGenerationMetadata(new HashMap<>());
        }
        if (userIdea != null) {
            entity.getGenerationMetadata().put("userIdea", userIdea);
        }
        
        // 保存对话历史
        if (chatHistory != null && !chatHistory.isEmpty()) {
            entity.setChatHistory(chatHistory);
        }

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

    @Transactional
    public ArtifactEntity saveAnalysis(Long id, Map<String, Object> analysis) {
        ArtifactEntity entity = artifactRepository.findByIdActive(id);
        if (entity == null) {
            throw new RuntimeException("设计不存在");
        }
        
        if (analysis.containsKey("marketAnalysis")) {
            entity.setMarketAnalysis((Map<String, Object>) analysis.get("marketAnalysis"));
        }
        if (analysis.containsKey("technicalFeasibility")) {
            entity.setTechnicalFeasibility((Map<String, Object>) analysis.get("technicalFeasibility"));
        }
        if (analysis.containsKey("riskAssessment")) {
            entity.setRiskAssessment((Map<String, Object>) analysis.get("riskAssessment"));
        }
        
        return artifactRepository.save(entity);
    }
}
