package heritage.gen.modules.community.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommunityPostDetailDTO {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorAvatarUrl;

    private Long artifactId;
    private Long projectId;

    private String title;
    private String content;
    private List<String> tags;

    private Integer viewCount;
    private Integer likeCount;
    private Long commentCount;
    private Boolean isPinned;

    private Boolean liked;
    private Boolean collected;

    private String remixPrompt;

    private ArtifactSnapshot artifact;
    private LocalDateTime createdAt;

    @Data
    public static class ArtifactSnapshot {
        private Long id;
        private String designName;
        private String designConcept;
        private String blueprintUrl;
        private String productShotUrl;
        private String kvUrl;
        private String lifestyleUrl;
        private String detailUrl;
    }
}
