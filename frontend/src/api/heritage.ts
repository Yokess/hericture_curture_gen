import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        const response = await apiClient.get<Result<PageResponse<ProjectListItem>>>('/heritage/projects', { params });
        return response.data.data; // 解包 Result
    },

    /**
     * 搜索项目
     */
    async searchProjects(keyword: string, page = 0, size = 12): Promise<PageResponse<ProjectListItem>> {
        const response = await apiClient.get<Result<PageResponse<ProjectListItem>>>('/heritage/projects/search', {
            params: { keyword, page, size }
        });
        return response.data.data; // 解包 Result
    },

    /**
     * 获取项目详情
     */
    async getProjectDetail(id: number): Promise<ProjectDetail> {
        const response = await apiClient.get<Result<ProjectDetail>>(`/heritage/projects/${id}`);
        return response.data.data; // 解包 Result
    },

    /**
     * 获取所有类别
     */
    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<Result<string[]>>('/heritage/categories');
        return response.data.data; // 解包 Result
    },

    /**
     * 获取所有地区
     */
    async getLocations(): Promise<string[]> {
        const response = await apiClient.get<Result<string[]>>('/heritage/locations');
        return response.data.data; // 解包 Result
    },
};
