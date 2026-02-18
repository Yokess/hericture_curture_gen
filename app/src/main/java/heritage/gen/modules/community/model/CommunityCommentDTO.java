package heritage.gen.modules.community.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommunityCommentDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private String authorName;
    private String authorAvatarUrl;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
    private List<CommunityCommentDTO> replies = new ArrayList<>();
}
