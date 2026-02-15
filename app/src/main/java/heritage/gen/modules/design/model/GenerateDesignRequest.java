package heritage.gen.modules.design.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateDesignRequest {
    @NotBlank(message = "创意描述不能为空")
    private String idea;
    
    // 可选参数
    private Boolean useRag; // 是否使用 RAG 增强 (默认 true)
    private Boolean generateImage; // 是否生成图片 (默认 true)
    
    // 分步生成参数
    private String conceptId; // 已有概念 ID (用于后续步骤)
    private DesignConcept concept; // 已有概念对象 (用于生成图片)
    private String blueprintUrl; // 草图 URL (用于生成效果图)
}
