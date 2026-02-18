package heritage.gen.modules.community.model;

import lombok.Data;

@Data
public class CreateCommentRequest {
    private String content;
    private Long parentId;
}
