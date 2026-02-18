package heritage.gen.modules.community.service;

import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.community.model.*;
import heritage.gen.modules.community.repository.ComCommentRepository;
import heritage.gen.modules.community.repository.ComInteractionRepository;
import heritage.gen.modules.community.repository.ComPostRepository;
import heritage.gen.modules.design.model.ArtifactEntity;
import heritage.gen.modules.design.repository.ArtifactRepository;
import heritage.gen.modules.user.model.SysUserEntity;
import heritage.gen.modules.user.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private static final String INTERACTION_LIKE = "LIKE";
    private static final String INTERACTION_COLLECT = "COLLECT";

    private final ComPostRepository postRepository;
    private final ComInteractionRepository interactionRepository;
    private final ComCommentRepository commentRepository;
    private final SysUserRepository userRepository;
    private final ArtifactRepository artifactRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public Page<CommunityPostListItemDTO> listPosts(Long projectId, String tag, String sort, int page, int size) {
        String sortKey = normalizeSort(sort);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));

        String tagJson = null;
        if (tag != null && !tag.isBlank() && !"全部".equals(tag)) {
            try {
                tagJson = objectMapper.writeValueAsString(List.of(tag));
            } catch (Exception ignored) {
                tagJson = "[\"" + tag + "\"]";
            }
        }

        Page<ComPostEntity> posts = postRepository.pageVisible(projectId, tagJson, sortKey, pageable);
        List<ComPostEntity> content = posts.getContent();
        if (content.isEmpty()) {
            return posts.map(p -> new CommunityPostListItemDTO());
        }

        Set<Long> userIds = content.stream().map(ComPostEntity::getUserId).collect(Collectors.toSet());
        Map<Long, SysUserEntity> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(SysUserEntity::getId, u -> u));

        Set<Long> postIds = content.stream().map(ComPostEntity::getId).collect(Collectors.toSet());
        Map<Long, Long> commentCounts = commentRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(ComCommentRepository.PostCount::getPostId, ComCommentRepository.PostCount::getCnt));

        Set<Long> artifactIds = content.stream().map(ComPostEntity::getArtifactId).collect(Collectors.toSet());
        Map<Long, ArtifactEntity> artifacts = artifactRepository.findAllById(artifactIds).stream()
                .collect(Collectors.toMap(ArtifactEntity::getId, a -> a));

        return posts.map(p -> toListItemDTO(p, users.get(p.getUserId()), artifacts.get(p.getArtifactId()), commentCounts.getOrDefault(p.getId(), 0L)));
    }

    @Transactional
    public CommunityPostDetailDTO getPostDetail(Long postId, Long currentUserId) {
        ComPostEntity post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));

        post.setViewCount(Optional.ofNullable(post.getViewCount()).orElse(0) + 1);
        postRepository.save(post);

        SysUserEntity author = userRepository.findById(post.getUserId()).orElse(null);
        ArtifactEntity artifact = artifactRepository.findByIdActive(post.getArtifactId());

        boolean liked = false;
        boolean collected = false;
        if (currentUserId != null) {
            liked = interactionRepository.findByUserIdAndPostIdAndType(currentUserId, postId, INTERACTION_LIKE).isPresent();
            collected = interactionRepository.findByUserIdAndPostIdAndType(currentUserId, postId, INTERACTION_COLLECT).isPresent();
        }

        long commentCount = commentRepository.countByPostIdAndIsDeletedFalse(postId);

        CommunityPostDetailDTO dto = new CommunityPostDetailDTO();
        dto.setId(post.getId());
        dto.setUserId(post.getUserId());
        dto.setAuthorName(authorName(author));
        dto.setAuthorAvatarUrl(author != null ? author.getAvatarUrl() : null);
        dto.setArtifactId(post.getArtifactId());
        dto.setProjectId(post.getProjectId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setTags(post.getTags());
        dto.setViewCount(post.getViewCount());
        dto.setLikeCount(post.getLikeCount());
        dto.setCommentCount(commentCount);
        dto.setIsPinned(post.getIsPinned());
        dto.setLiked(liked);
        dto.setCollected(collected);
        dto.setCreatedAt(post.getCreatedAt());

        if (artifact != null) {
            CommunityPostDetailDTO.ArtifactSnapshot snap = new CommunityPostDetailDTO.ArtifactSnapshot();
            snap.setId(artifact.getId());
            snap.setDesignName(artifact.getDesignName());
            snap.setDesignConcept(artifact.getDesignConcept());
            snap.setBlueprintUrl(artifact.getBlueprintUrl());
            snap.setProductShotUrl(artifact.getProductShotUrl());
            snap.setKvUrl(artifact.getKvUrl());
            snap.setLifestyleUrl(artifact.getLifestyleUrl());
            snap.setDetailUrl(artifact.getDetailUrl());
            dto.setArtifact(snap);

            dto.setRemixPrompt(buildRemixPrompt(artifact));
        }

        return dto;
    }

    @Transactional
    public ComPostEntity createPost(Long userId, CreatePostRequest request, boolean isAdmin) {
        if (request == null || request.getArtifactId() == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "缺少 artifactId");
        }
        Optional<ComPostEntity> existing = postRepository.findFirstByArtifactIdAndIsDeletedFalseOrderByCreatedAtDesc(request.getArtifactId());
        if (existing.isPresent()) {
            ComPostEntity p = existing.get();
            if (!Objects.equals(p.getUserId(), userId) && !isAdmin) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "无权限发布该作品");
            }
            return p;
        }
        ArtifactEntity artifact = artifactRepository.findByIdActive(request.getArtifactId());
        if (artifact == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "作品不存在");
        }
        if (!Objects.equals(artifact.getUserId(), userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权限发布该作品");
        }
        if (!"PUBLISHED".equals(artifact.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请先发布设计作品");
        }

        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = artifact.getDesignName() != null && !artifact.getDesignName().isBlank() ? artifact.getDesignName() : "未命名作品";
        }
        if (title.length() > 200) {
            title = title.substring(0, 200);
        }

        String content = request.getContent();
        if (content == null || content.isBlank()) {
            content = artifact.getDesignConcept();
        }

        ComPostEntity post = new ComPostEntity();
        post.setUserId(userId);
        post.setArtifactId(artifact.getId());
        post.setProjectId(request.getProjectId());
        post.setTitle(title);
        post.setContent(content);
        post.setTags(normalizeTags(request.getTags()));
        post.setIsPinned(isAdmin ? Boolean.FALSE : Boolean.FALSE);
        return postRepository.save(post);
    }

    @Transactional
    public InteractionResultDTO toggleLike(Long postId, Long userId) {
        ComPostEntity post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));

        Optional<ComInteractionEntity> existing = interactionRepository.findByUserIdAndPostIdAndType(userId, postId, INTERACTION_LIKE);
        InteractionResultDTO dto = new InteractionResultDTO();
        int likeCount = Optional.ofNullable(post.getLikeCount()).orElse(0);

        if (existing.isPresent()) {
            interactionRepository.delete(existing.get());
            likeCount = Math.max(0, likeCount - 1);
            post.setLikeCount(likeCount);
            postRepository.save(post);
            dto.setActive(false);
            dto.setLikeCount(likeCount);
            return dto;
        }

        ComInteractionEntity interaction = new ComInteractionEntity();
        interaction.setUserId(userId);
        interaction.setPostId(postId);
        interaction.setType(INTERACTION_LIKE);
        interactionRepository.save(interaction);
        likeCount = likeCount + 1;
        post.setLikeCount(likeCount);
        postRepository.save(post);
        dto.setActive(true);
        dto.setLikeCount(likeCount);
        return dto;
    }

    @Transactional
    public InteractionResultDTO toggleCollect(Long postId, Long userId) {
        postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));

        Optional<ComInteractionEntity> existing = interactionRepository.findByUserIdAndPostIdAndType(userId, postId, INTERACTION_COLLECT);
        InteractionResultDTO dto = new InteractionResultDTO();
        if (existing.isPresent()) {
            interactionRepository.delete(existing.get());
            dto.setActive(false);
            return dto;
        }
        ComInteractionEntity interaction = new ComInteractionEntity();
        interaction.setUserId(userId);
        interaction.setPostId(postId);
        interaction.setType(INTERACTION_COLLECT);
        interactionRepository.save(interaction);
        dto.setActive(true);
        return dto;
    }

    public List<CommunityCommentDTO> listComments(Long postId) {
        postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));

        List<ComCommentEntity> comments = commentRepository.findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(postId);
        if (comments.isEmpty()) {
            return new ArrayList<>();
        }
        Set<Long> userIds = comments.stream().map(ComCommentEntity::getUserId).collect(Collectors.toSet());
        Map<Long, SysUserEntity> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(SysUserEntity::getId, u -> u));

        Map<Long, CommunityCommentDTO> dtoMap = new HashMap<>();
        for (ComCommentEntity c : comments) {
            SysUserEntity u = users.get(c.getUserId());
            CommunityCommentDTO dto = new CommunityCommentDTO();
            dto.setId(c.getId());
            dto.setPostId(c.getPostId());
            dto.setUserId(c.getUserId());
            dto.setAuthorName(authorName(u));
            dto.setAuthorAvatarUrl(u != null ? u.getAvatarUrl() : null);
            dto.setContent(c.getContent());
            dto.setParentId(c.getParentId());
            dto.setCreatedAt(c.getCreatedAt());
            dtoMap.put(dto.getId(), dto);
        }

        List<CommunityCommentDTO> roots = new ArrayList<>();
        for (CommunityCommentDTO dto : dtoMap.values()) {
            if (dto.getParentId() == null) {
                roots.add(dto);
            } else {
                CommunityCommentDTO parent = dtoMap.get(dto.getParentId());
                if (parent == null) {
                    roots.add(dto);
                } else {
                    parent.getReplies().add(dto);
                }
            }
        }
        roots.sort(Comparator.comparing(CommunityCommentDTO::getCreatedAt));
        for (CommunityCommentDTO r : roots) {
            r.getReplies().sort(Comparator.comparing(CommunityCommentDTO::getCreatedAt));
        }
        return roots;
    }

    @Transactional
    public CommunityCommentDTO addComment(Long postId, Long userId, CreateCommentRequest request) {
        postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));

        if (request == null || request.getContent() == null || request.getContent().isBlank()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "评论内容不能为空");
        }
        String content = request.getContent().trim();
        if (content.length() > 1000) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "评论内容过长");
        }

        Long parentId = request.getParentId();
        if (parentId != null) {
            ComCommentEntity parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "父评论不存在"));
            if (!Objects.equals(parent.getPostId(), postId) || Boolean.TRUE.equals(parent.getIsDeleted())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "父评论不合法");
            }
        }

        ComCommentEntity entity = new ComCommentEntity();
        entity.setPostId(postId);
        entity.setUserId(userId);
        entity.setContent(content);
        entity.setParentId(parentId);
        ComCommentEntity saved = commentRepository.save(entity);

        SysUserEntity u = userRepository.findById(userId).orElse(null);
        CommunityCommentDTO dto = new CommunityCommentDTO();
        dto.setId(saved.getId());
        dto.setPostId(saved.getPostId());
        dto.setUserId(saved.getUserId());
        dto.setAuthorName(authorName(u));
        dto.setAuthorAvatarUrl(u != null ? u.getAvatarUrl() : null);
        dto.setContent(saved.getContent());
        dto.setParentId(saved.getParentId());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }

    @Transactional
    public void setPinned(Long postId, boolean pinned) {
        ComPostEntity post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));
        post.setIsPinned(pinned);
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        ComPostEntity post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "帖子不存在"));
        post.setIsDeleted(true);
        postRepository.save(post);
    }

    private CommunityPostListItemDTO toListItemDTO(ComPostEntity p, SysUserEntity author, ArtifactEntity artifact, Long commentCount) {
        CommunityPostListItemDTO dto = new CommunityPostListItemDTO();
        dto.setId(p.getId());
        dto.setUserId(p.getUserId());
        dto.setAuthorName(authorName(author));
        dto.setAuthorAvatarUrl(author != null ? author.getAvatarUrl() : null);
        dto.setArtifactId(p.getArtifactId());
        dto.setProjectId(p.getProjectId());
        dto.setTitle(p.getTitle());
        dto.setTags(p.getTags());
        dto.setViewCount(Optional.ofNullable(p.getViewCount()).orElse(0));
        dto.setLikeCount(Optional.ofNullable(p.getLikeCount()).orElse(0));
        dto.setCommentCount(commentCount);
        dto.setIsPinned(Boolean.TRUE.equals(p.getIsPinned()));
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getContent() != null) {
            String s = p.getContent().strip();
            dto.setContentPreview(s.length() > 80 ? s.substring(0, 80) + "…" : s);
        }
        dto.setCoverUrl(pickCoverUrl(artifact));
        return dto;
    }

    private String pickCoverUrl(ArtifactEntity artifact) {
        if (artifact == null) return null;
        if (artifact.getKvUrl() != null && !artifact.getKvUrl().isBlank()) return artifact.getKvUrl();
        if (artifact.getProductShotUrl() != null && !artifact.getProductShotUrl().isBlank()) return artifact.getProductShotUrl();
        if (artifact.getBlueprintUrl() != null && !artifact.getBlueprintUrl().isBlank()) return artifact.getBlueprintUrl();
        return null;
    }

    private String normalizeSort(String sort) {
        String s = sort == null ? "latest" : sort.trim();
        if ("likes".equalsIgnoreCase(s)) return "likes";
        if ("popular".equalsIgnoreCase(s)) return "popular";
        return "latest";
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null) return new ArrayList<>();
        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String t : tags) {
            if (t == null) continue;
            String s = t.trim();
            if (s.isEmpty()) continue;
            if (s.length() > 20) s = s.substring(0, 20);
            set.add(s);
            if (set.size() >= 10) break;
        }
        return new ArrayList<>(set);
    }

    private String authorName(SysUserEntity u) {
        if (u == null) return "匿名用户";
        if (u.getNickname() != null && !u.getNickname().isBlank()) return u.getNickname();
        return u.getUsername();
    }

    private String buildRemixPrompt(ArtifactEntity artifact) {
        StringBuilder sb = new StringBuilder();
        if (artifact.getDesignName() != null) {
            sb.append("作品：").append(artifact.getDesignName()).append("\n");
        }
        if (artifact.getDesignConcept() != null && !artifact.getDesignConcept().isBlank()) {
            sb.append("设计理念：").append(artifact.getDesignConcept()).append("\n");
        }
        Map<String, Object> md = artifact.getGenerationMetadata();
        if (md != null) {
            Object kvPromptText = md.get("kvPromptText");
            if (kvPromptText != null) {
                sb.append("\n---\nKV提示词系统：\n").append(kvPromptText);
            }
        }
        return sb.toString().trim();
    }
}
