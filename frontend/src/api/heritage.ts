import request from '@/utils/request';

// ==================== 类型定义 ====================

/**
 * 后端统一响应格式
 */
interface Result<T> {
    code: number;
    message: string;
    data: T;
    success: boolean;
}

/**
 * 非遗项目列表项
 */
export interface ProjectListItem {
    id: number;
    officialId: string;
    name: string;
    category: string;
    location: string;
    batch: string;
    successorCount: number;
}

/**
 * 传承人列表项
 */
export interface SuccessorListItem {
    id: number;
    name: string;
    gender?: string;
    birthYear?: string;
    projectName: string;
    description?: string;
    officialUrl?: string;
}

/**
 * 非遗项目详情
 */
export interface ProjectDetail {
    id: number;
    officialId: string;
    name: string;
    category: string;
    location: string;
    description: string;
    batch: string;
    officialUrl?: string;
    successors: SuccessorListItem[];
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;  // 当前页码
    size: number;    // 每页数量
}

// ==================== API 接口 ====================

export const heritageApi = {
    /**
     * 获取项目列表
     */
    async listProjects(params: {
        category?: string;
        location?: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<ProjectListItem>> {
        const response = await request.get<any, Result<PageResponse<ProjectListItem>>>('/api/heritage/projects', { params });
        return response.data; // request 已经解包了一层，这里返回的 response 是 data
    },

    /**
     * 搜索项目
     */
    async searchProjects(keyword: string, page = 0, size = 12): Promise<PageResponse<ProjectListItem>> {
        const response = await request.get<any, Result<PageResponse<ProjectListItem>>>('/api/heritage/projects/search', {
            params: { keyword, page, size }
        });
        return response.data;
    },

    /**
     * 获取项目详情
     */
    async getProjectDetail(id: number): Promise<ProjectDetail> {
        const response = await request.get<any, Result<ProjectDetail>>(`/api/heritage/projects/${id}`);
        return response.data;
    },

    /**
     * 获取所有类别
     */
    async getCategories(): Promise<string[]> {
        const response = await request.get<any, Result<string[]>>('/api/heritage/categories');
        return response.data;
    },

    /**
     * 获取所有地区
     */
    async getLocations(): Promise<string[]> {
        const response = await request.get<any, Result<string[]>>('/api/heritage/locations');
        return response.data;
    },
};
