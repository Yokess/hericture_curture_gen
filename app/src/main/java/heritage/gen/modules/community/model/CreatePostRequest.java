package heritage.gen.modules.community.model;

import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {
    private Long artifactId;
    private Long projectId;
    private String title;
    private String content;
    private List<String> tags;
}
