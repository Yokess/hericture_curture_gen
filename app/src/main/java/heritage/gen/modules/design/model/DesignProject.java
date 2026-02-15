package heritage.gen.modules.design.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 完整的设计项目 (包含概念 + 视觉图)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesignProject {
    private String id;
    private DesignConcept concept;
    private String blueprintUrl; // 设计草图 URL
    private String productShotUrl; // 产品效果图 URL

    // 扁平化属性方便前端使用 (可选，如果前端能直接处理嵌套对象则不需要)
    public String getConceptName() {
        return concept != null ? concept.getConceptName() : null;
    }
}
