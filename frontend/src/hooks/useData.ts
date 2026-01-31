import { useState, useEffect } from 'react';
import type {
    HeritageProject,
    ProjectWithSuccessors,
    DesignArtifact,
    VideoWithSteps,
    PostWithDetails,
    UserWithStats,
} from '@/types';
import { api } from '@/api';

// ==================== 通用 Hook ====================

interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * 通用异步数据获取 Hook
 */
function useAsync<T>(
    asyncFunction: () => Promise<T>,
    dependencies: any[] = []
): UseAsyncState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFunction();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { data, loading, error, refetch: fetchData };
}

// ==================== 非遗项目 Hooks ====================

/**
 * 获取所有非遗项目
 */
export function useProjects() {
    return useAsync<HeritageProject[]>(() => api.projects.getAll());
}

/**
 * 根据 ID 获取项目详情
 */
export function useProject(id: number) {
    return useAsync<ProjectWithSuccessors | null>(
        () => api.projects.getById(id),
        [id]
    );
}

/**
 * 根据类别获取项目
 */
export function useProjectsByCategory(category: string) {
    return useAsync<HeritageProject[]>(
        () => api.projects.getByCategory(category),
        [category]
    );
}

/**
 * 搜索项目
 */
export function useProjectSearch(keyword: string) {
    return useAsync<HeritageProject[]>(
        () => api.projects.search(keyword),
        [keyword]
    );
}

// ==================== AI 设计 Hooks ====================

/**
 * 获取用户的设计作品
 */
export function useUserArtifacts(userId: number) {
    return useAsync<DesignArtifact[]>(
        () => api.design.getUserArtifacts(userId),
        [userId]
    );
}

/**
 * 根据 ID 获取设计详情
 */
export function useArtifact(id: number) {
    return useAsync<DesignArtifact | null>(
        () => api.design.getById(id),
        [id]
    );
}

// ==================== 视频档案 Hooks ====================

/**
 * 获取所有视频
 */
export function useVideos() {
    return useAsync<VideoWithSteps[]>(() => api.video.getAll());
}

/**
 * 根据 ID 获取视频详情
 */
export function useVideo(id: number) {
    return useAsync<VideoWithSteps | null>(
        () => api.video.getById(id),
        [id]
    );
}

/**
 * 根据项目 ID 获取视频
 */
export function useVideosByProject(projectId: number) {
    return useAsync<VideoWithSteps[]>(
        () => api.video.getByProject(projectId),
        [projectId]
    );
}

// ==================== 社区 Hooks ====================

/**
 * 获取所有帖子
 */
export function usePosts() {
    return useAsync<PostWithDetails[]>(() => api.community.getAllPosts());
}

/**
 * 根据 ID 获取帖子详情
 */
export function usePost(id: number) {
    return useAsync<PostWithDetails | null>(
        () => api.community.getPostById(id),
        [id]
    );
}

/**
 * 根据标签获取帖子
 */
export function usePostsByTag(tag: string) {
    return useAsync<PostWithDetails[]>(
        () => api.community.getPostsByTag(tag),
        [tag]
    );
}

// ==================== 用户 Hooks ====================

/**
 * 获取当前登录用户
 */
export function useCurrentUser() {
    return useAsync<UserWithStats | null>(() => api.user.getCurrentUser());
}

/**
 * 根据 ID 获取用户信息
 */
export function useUser(id: number) {
    return useAsync<UserWithStats | null>(
        () => api.user.getById(id),
        [id]
    );
}

// ==================== 交互 Hooks ====================

/**
 * 点赞功能 Hook
 */
export function useLike() {
    const [loading, setLoading] = useState(false);

    const like = async (postId: number) => {
        setLoading(true);
        try {
            await api.community.likePost(postId);
            return true;
        } catch (error) {
            console.error('点赞失败:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { like, loading };
}

/**
 * 收藏功能 Hook
 */
export function useCollect() {
    const [loading, setLoading] = useState(false);

    const collect = async (postId: number) => {
        setLoading(true);
        try {
            await api.community.collectPost(postId);
            return true;
        } catch (error) {
            console.error('收藏失败:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { collect, loading };
}

/**
 * 评论功能 Hook
 */
export function useComment() {
    const [loading, setLoading] = useState(false);

    const addComment = async (postId: number, content: string) => {
        setLoading(true);
        try {
            await api.community.addComment(postId, content);
            return true;
        } catch (error) {
            console.error('评论失败:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addComment, loading };
}
