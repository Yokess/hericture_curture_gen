package heritage.gen.modules.design.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DesignProject {
    private String id;
    private DesignConcept concept;
    private String blueprintUrl;
    private String productShotUrl;
    private String kvUrl;
    private String lifestyleUrl;
    private String detailUrl;

    private String conceptName;
    private String designPhilosophy;
    private String culturalContext;
    private String formFactor;
    private String dimensions;
    private String userInteraction;
    private List<DesignConcept.Material> materials;
    private List<DesignConcept.Color> colors;
    private List<String> keyFeatures;

    // 显式构造函数
    public DesignProject(String id, DesignConcept concept, String blueprintUrl, String productShotUrl) {
        this.id = id;
        this.concept = concept;
        this.blueprintUrl = blueprintUrl;
        this.productShotUrl = productShotUrl;
    }

    // 兼容方法：从 concept 同步数据
    public void syncFromConcept() {
        if (concept != null) {
            this.conceptName = concept.getConceptName();
            this.designPhilosophy = concept.getDesignPhilosophy();
            this.culturalContext = concept.getCulturalContext();
            this.formFactor = concept.getFormFactor();
            this.dimensions = concept.getDimensions();
            this.userInteraction = concept.getUserInteraction();
            this.materials = concept.getMaterials();
            this.colors = concept.getColors();
            this.keyFeatures = concept.getKeyFeatures();
        }
    }
}
