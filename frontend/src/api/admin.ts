import request from '@/utils/request';

// ========== 类型定义 ==========

export interface Result<T> {
    code: number;
    message: string;
    data: T;
}

export interface User {
    id: number;
    username: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    isAdmin: boolean;
    enabled: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface PageResult<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// ========== API 方法 ==========

export const adminApi = {
    /**
     * 获取用户列表
     */
    async listUsers(params?: {
        page?: number;
        size?: number;
        keyword?: string;
        enabled?: boolean;
    }): Promise<PageResult<User>> {
        const response = await request.get<any, Result<PageResult<User>>>('/api/admin/users', { params });
        return response.data;
    },

    /**
     * 禁用/启用用户
     */
    async toggleUserStatus(userId: number, enabled: boolean): Promise<void> {
        await request.put(`/api/admin/users/${userId}/status`, { enabled });
    },

    /**
     * 设置用户角色
     */
    async setUserRole(userId: number, isAdmin: boolean): Promise<void> {
        await request.put(`/api/admin/users/${userId}/role`, { isAdmin });
    },

    // ... User methods ...

    /**
     * 删除用户
     */
    async deleteUser(userId: number): Promise<void> {
        await request.delete(`/api/admin/users/${userId}`);
    },

    // ========== 非遗项目管理 ==========

    async listHeritageProjects(params?: {
        page?: number;
        size?: number;
        keyword?: string;
        category?: string;
    }): Promise<PageResult<HeritageProject>> {
        const response = await request.get<any, Result<PageResult<HeritageProject>>>('/api/admin/heritage/projects', { params });
        return response.data;
    },

    async createHeritageProject(data: Partial<HeritageProject>): Promise<HeritageProject> {
        const response = await request.post<any, Result<HeritageProject>>('/api/admin/heritage/projects', data);
        return response.data;
    },

    async updateHeritageProject(id: number, data: Partial<HeritageProject>): Promise<HeritageProject> {
        const response = await request.put<any, Result<HeritageProject>>(`/api/admin/heritage/projects/${id}`, data);
        return response.data;
    },

    async deleteHeritageProject(id: number): Promise<void> {
        await request.delete(`/api/admin/heritage/projects/${id}`);
    },

    // ========== 传承人管理 ==========

    async listSuccessors(params?: {
        page?: number;
        size?: number;
        keyword?: string;
        projectId?: number;
    }): Promise<PageResult<Successor>> {
        const response = await request.get<any, Result<PageResult<Successor>>>('/api/admin/heritage/successors', { params });
        return response.data;
    },

    async createSuccessor(data: Partial<Successor>): Promise<Successor> {
        const response = await request.post<any, Result<Successor>>('/api/admin/heritage/successors', data);
        return response.data;
    },

    async updateSuccessor(id: number, data: Partial<Successor>): Promise<Successor> {
        const response = await request.put<any, Result<Successor>>(`/api/admin/heritage/successors/${id}`, data);
        return response.data;
    },

    async deleteSuccessor(id: number): Promise<void> {
        await request.delete(`/api/admin/heritage/successors/${id}`);
    },
};

// ... Type Definitions ...
export interface HeritageProject {
    id: number;
    officialId: string;
    name: string;
    category?: string;
    location?: string;
    description?: string;
    batch?: string;
    officialUrl?: string;
    createdAt?: string;
}

export interface Successor {
    id: number;
    projectId: number;
    name: string;
    gender?: string;
    birthYear?: string;
    description?: string;
    officialUrl?: string;
    createdAt?: string;
}
