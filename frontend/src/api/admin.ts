import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('heritage_auth_token');
        if (token) {
            config.headers.Authorization = token; // 后端期望的格式（Sa-Token）
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        // 后端返回的是 Result { code, message, data }
        // 直接返回原始响应，让调用方处理
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('heritage_auth_token');
            localStorage.removeItem('heritage_user_info');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

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
        const response = await apiClient.get<Result<PageResult<User>>>('/api/admin/users', { params });
        // 后端返回 Result { code, message, data: Page }
        // 需要从 response.data.data 中获取 Page 数据
        return response.data.data;
    },

    /**
     * 禁用/启用用户
     */
    async toggleUserStatus(userId: number, enabled: boolean): Promise<void> {
        await apiClient.put(`/api/admin/users/${userId}/status`, { enabled });
    },

    /**
     * 设置用户角色
     */
    async setUserRole(userId: number, isAdmin: boolean): Promise<void> {
        await apiClient.put(`/api/admin/users/${userId}/role`, { isAdmin });
    },

    /**
     * 删除用户
     */
    async deleteUser(userId: number): Promise<void> {
        await apiClient.delete(`/api/admin/users/${userId}`);
    },
};
