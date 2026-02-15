package heritage.gen.modules.design.model;

import lombok.Data;
import java.util.List;

/**
 * 结构化设计概念 (由 LLM 生成)
 */
@Data
public class DesignConcept {
    private String conceptName;        // 概念名称
    private String designPhilosophy;   // 设计理念
    private String culturalContext;    // 文化脉络 (来自 RAG)
    private String formFactor;         // 造型语言
    private String dimensions;         // 尺寸规格
    private String userInteraction;    // 交互逻辑
    
    private List<Material> materials;  // 材质建议
    private List<Color> colors;        // 色彩建议
    private List<String> keyFeatures;  // 功能特性

    @Data
    public static class Material {
        private String name;
        private String finish; // 表面处理 (如: 磨砂、抛光)
    }

    @Data
    public static class Color {
        private String name;
        private String hex;
    }
}
