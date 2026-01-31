import type {
    HeritageProject,
    ProjectWithSuccessors,
    DesignArtifact,
    Video,
    VideoWithSteps,
    CommunityPost,
    PostWithDetails,
    User,
    UserWithStats,
} from '@/types';

import {
    mockProjects,
    mockProjectsWithSuccessors,
    mockArtifacts,
    mockVideos,
    mockVideosWithSteps,
    mockPosts,
    mockPostsWithDetails,
    mockUsers,
    mockUsersWithStats,
} from '@/data/mockData';

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== 非遗项目 API ====================

export const projectsApi = {
    /**
     * 获取所有非遗项目
     */
    async getAll(): Promise<HeritageProject[]> {
        await delay(300);
        return mockProjects;
    },

    /**
     * 根据 ID 获取项目详情(含传承人)
     */
    async getById(id: number): Promise<ProjectWithSuccessors | null> {
        await delay(200);
        return mockProjectsWithSuccessors.find((p) => p.id === id) || null;
    },

    /**
     * 根据类别筛选项目
     */
    async getByCategory(category: string): Promise<HeritageProject[]> {
        await delay(250);
        return mockProjects.filter((p) => p.category === category);
    },

    /**
     * 搜索项目
     */
    async search(keyword: string): Promise<HeritageProject[]> {
        await delay(300);
        const lowerKeyword = keyword.toLowerCase();
        return mockProjects.filter(
            (p) =>
                p.name.toLowerCase().includes(lowerKeyword) ||
                p.description.toLowerCase().includes(lowerKeyword) ||
                p.location.toLowerCase().includes(lowerKeyword)
        );
    },
};

// ==================== AI 设计 API ====================

export const designApi = {
    /**
     * 获取用户的所有设计作品
     */
    async getUserArtifacts(userId: number): Promise<DesignArtifact[]> {
        await delay(200);
        return mockArtifacts.filter((a) => a.userId === userId);
    },

    /**
     * 根据 ID 获取设计详情
     */
    async getById(id: number): Promise<DesignArtifact | null> {
        await delay(150);
        return mockArtifacts.find((a) => a.id === id) || null;
    },

    /**
     * 创建新设计(模拟)
     */
    async create(data: Partial<DesignArtifact>): Promise<DesignArtifact> {
        await delay(500);
        const newArtifact: DesignArtifact = {
            id: mockArtifacts.length + 1,
            userId: data.userId || 1,
            designName: data.designName || '未命名设计',
            designConcept: data.designConcept || '',
            imageKeys: data.imageKeys || [],
            selectedIndex: 0,
            createdAt: new Date().toISOString(),
        };
        return newArtifact;
    },
};

// ==================== 视频档案 API ====================

export const videoApi = {
    /**
     * 获取所有视频
     */
    async getAll(): Promise<VideoWithSteps[]> {
        await delay(300);
        return mockVideosWithSteps;
    },

    /**
     * 根据 ID 获取视频详情(含步骤)
     */
    async getById(id: number): Promise<VideoWithSteps | null> {
        await delay(200);
        return mockVideosWithSteps.find((v) => v.id === id) || null;
    },

    /**
     * 根据项目 ID 获取视频
     */
    async getByProject(projectId: number): Promise<VideoWithSteps[]> {
        await delay(250);
        return mockVideosWithSteps.filter((v) => v.projectId === projectId);
    },

    /**
     * 上传视频(模拟)
     */
    async upload(file: File, projectId?: number): Promise<Video> {
        await delay(1000);
        const newVideo: Video = {
            id: mockVideos.length + 1,
            userId: 1,
            projectId,
            originalFilename: file.name,
            videoKey: `videos/${Date.now()}_${file.name}`,
            fileSize: file.size,
            mimeType: file.type,
            analysisStatus: 'PENDING',
            createdAt: new Date().toISOString(),
        };
        return newVideo;
    },
};

// ==================== 社区 API ====================

export const communityApi = {
    /**
     * 获取所有帖子(含详情)
     */
    async getAllPosts(): Promise<PostWithDetails[]> {
        await delay(300);
        return mockPostsWithDetails;
    },

    /**
     * 根据 ID 获取帖子详情
     */
    async getPostById(id: number): Promise<PostWithDetails | null> {
        await delay(200);
        return mockPostsWithDetails.find((p) => p.id === id) || null;
    },

    /**
     * 根据标签筛选帖子
     */
    async getPostsByTag(tag: string): Promise<PostWithDetails[]> {
        await delay(250);
        return mockPostsWithDetails.filter((p) => p.tags?.includes(tag));
    },

    /**
     * 点赞帖子(模拟)
     */
    async likePost(postId: number): Promise<{ success: boolean }> {
        await delay(150);
        return { success: true };
    },

    /**
     * 收藏帖子(模拟)
     */
    async collectPost(postId: number): Promise<{ success: boolean }> {
        await delay(150);
        return { success: true };
    },

    /**
     * 发表评论(模拟)
     */
    async addComment(postId: number, content: string): Promise<{ success: boolean }> {
        await delay(200);
        return { success: true };
    },
};

// ==================== 用户 API ====================

export const userApi = {
    /**
     * 获取用户信息(含统计)
     */
    async getById(id: number): Promise<UserWithStats | null> {
        await delay(200);
        return mockUsersWithStats.find((u) => u.id === id) || null;
    },

    /**
     * 获取当前登录用户
     */
    async getCurrentUser(): Promise<UserWithStats | null> {
        await delay(150);
        // 模拟返回第一个用户
        return mockUsersWithStats[0];
    },

    /**
     * 更新用户信息(模拟)
     */
    async update(id: number, data: Partial<User>): Promise<User> {
        await delay(300);
        const user = mockUsers.find((u) => u.id === id);
        if (!user) throw new Error('User not found');
        return { ...user, ...data, updatedAt: new Date().toISOString() };
    },
};

// ==================== 统一导出 ====================

export const api = {
    projects: projectsApi,
    design: designApi,
    video: videoApi,
    community: communityApi,
    user: userApi,
};
