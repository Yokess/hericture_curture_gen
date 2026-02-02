import axios from 'axios';

// 创建 axios 实例
const authClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token 存储键名
const TOKEN_KEY = 'heritage_auth_token';
const USER_KEY = 'heritage_user_info';

// 请求拦截器 - 自动添加 Token
authClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            // 后端使用 Authorization 作为 Token 名称
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理统一响应格式和 401
authClient.interceptors.response.use(
    (response) => {
        // 后端返回格式：{ code: 200, message: "success", data: {...} }
        const { code, message, data } = response.data;

        if (code === 200) {
            return { ...response, data }; // 返回 data 部分
        }

        // 处理业务错误
        return Promise.reject(new Error(message || '请求失败'));
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.data?.code === 401) {
            // 清除 Token
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            // 跳转到登录页
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== 类型定义 ====================

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
    nickname?: string;
}

/**
 * 后端登录响应格式
 */
export interface LoginResponse {
    userId: number;
    username: string;
    nickname: string;
    token: string;
    isAdmin: boolean;
}

/**
 * 后端注册响应格式
 */
export interface RegisterResponse {
    userId: number;
    username: string;
    message: string;
}

/**
 * 用户信息
 */
export interface UserProfile {
    id: number;
    username: string;
    nickname: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
    status: string;
    createdAt: string;
}

// ==================== 认证 API ====================

export const authApi = {
    /**
     * 用户登录
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await authClient.post<LoginResponse>('/auth/login', data);
        const loginData = response.data;

        // 保存 Token 和用户信息
        if (loginData.token) {
            localStorage.setItem(TOKEN_KEY, loginData.token);
            localStorage.setItem(USER_KEY, JSON.stringify({
                id: loginData.userId,
                username: loginData.username,
                nickname: loginData.nickname,
                isAdmin: loginData.isAdmin,
            }));
        }

        return loginData;
    },

    /**
     * 用户注册
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await authClient.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * 用户登出
     */
    async logout(): Promise<void> {
        try {
            await authClient.post('/auth/logout');
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    },

    /**
     * 获取当前用户信息
     */
    async getCurrentUser(): Promise<UserProfile | null> {
        try {
            const response = await authClient.get<UserProfile>('/user/profile');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * 更新用户信息
     */
    async updateProfile(data: { nickname?: string; avatarUrl?: string }): Promise<UserProfile> {
        const response = await authClient.put<UserProfile>('/user/profile', data);
        return response.data;
    },

    /**
     * 修改密码
     */
    async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
        await authClient.put('/user/password', data);
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    /**
     * 获取本地存储的用户信息
     */
    getLocalUser(): { id: number; username: string; nickname: string; isAdmin: boolean } | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    /**
     * 获取 Token
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
};

