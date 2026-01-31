// ==================== 用户系统 ====================

export type UserStatus = 'ACTIVE' | 'BANNED';

export interface User {
    id: number;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UserAchievement {
    id: number;
    userId: number;
    achievementName: string;
    badgeIconUrl?: string;
    obtainedAt: string;
}

// ==================== 非遗项目 ====================

export interface HeritageProject {
    id: number;
    officialId: string;
    name: string;
    category: string;
    location: string;
    description: string;
    batch: string;
    officialUrl?: string;
    createdAt: string;
}

export interface HeritageSuccessor {
    id: number;
    projectId: number;
    name: string;
    gender?: string;
    birthYear?: string;
    description?: string;
    createdAt: string;
}

// ==================== RAG 知识库 ====================

export type RefType = 'PROJECT' | 'SUCCESSOR';

export interface KnowledgeChunk {
    id: number;
    refId: number;
    refType: RefType;
    contentText: string;
    chunkOrder?: number;
    documentId?: number;
    metadata?: Record<string, any>;
    createdAt: string;
}

// ==================== AI 设计生成 ====================

export interface CreativeSession {
    id: number;
    userId: number;
    title: string;
    createdAt: string;
}

export interface DesignArtifact {
    id: number;
    userId: number;
    designName: string;
    designConcept: string;
    imageKeys: string[];
    selectedIndex: number;
    generationMetadata?: {
        model?: string;
        costMs?: number;
        requestId?: string;
        [key: string]: any;
    };
    createdAt: string;
}

// ==================== 视频档案 ====================

export type VideoAnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Video {
    id: number;
    userId: number;
    projectId?: number;
    originalFilename: string;
    videoKey: string;
    fileSize: number;
    mimeType: string;
    analysisStatus: VideoAnalysisStatus;
    errorMsg?: string;
    createdAt: string;
}

export interface ProcessStep {
    id: number;
    videoId: number;
    stepOrder: number;
    stepName: string;
    description: string;
    keyframeKey?: string;
    startTimeMs: number;
    endTimeMs: number;
    createdAt: string;
}

// ==================== 社区 ====================

export interface CommunityPost {
    id: number;
    userId: number;
    artifactId?: number;
    projectId?: number;
    title: string;
    content: string;
    tags?: string[];
    viewCount: number;
    likeCount: number;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    // 关联数据
    user?: User;
    artifact?: DesignArtifact;
    project?: HeritageProject;
}

export type InteractionType = 'LIKE' | 'COLLECT';

export interface Interaction {
    id: number;
    userId: number;
    postId: number;
    type: InteractionType;
    createdAt: string;
}

export interface Comment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    parentId?: number;
    createdAt: string;
    // 关联数据
    user?: User;
    replies?: Comment[];
}

// ==================== 扩展类型 (前端专用) ====================

// 带统计信息的用户
export interface UserWithStats extends User {
    totalDesigns: number;
    totalLikes: number;
    totalCollections: number;
    achievements: UserAchievement[];
}

// 带传承人的项目
export interface ProjectWithSuccessors extends HeritageProject {
    successors: HeritageSuccessor[];
}

// 带步骤的视频
export interface VideoWithSteps extends Video {
    steps: ProcessStep[];
    project?: HeritageProject;
}

// 带完整信息的帖子
export interface PostWithDetails extends CommunityPost {
    user: User;
    artifact?: DesignArtifact;
    project?: HeritageProject;
    comments: Comment[];
    isLiked: boolean;
    isCollected: boolean;
}
