package heritage.gen.modules.community.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommunityPostListItemDTO {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorAvatarUrl;

    private Long artifactId;
    private Long projectId;

    private String title;
    private String contentPreview;
    private List<String> tags;

    private Integer viewCount;
    private Integer likeCount;
    private Long commentCount;
    private Boolean isPinned;

    private String coverUrl;
    private LocalDateTime createdAt;
}
