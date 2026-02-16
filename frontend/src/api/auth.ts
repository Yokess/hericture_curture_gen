import request from '@/utils/request';
import { tokenStorage } from '@/utils/tokenStorage';

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
    avatarUrl?: string;
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
        const response = await request.post<LoginResponse>('/api/auth/login', data);
        const loginData = response.data;

        // 保存 Token 和用户信息
        if (loginData.token) {
            tokenStorage.setToken(loginData.token);
            tokenStorage.setUser({
                id: loginData.userId,
                username: loginData.username,
                nickname: loginData.nickname,
                isAdmin: loginData.isAdmin,
                avatarUrl: loginData.avatarUrl,
            });
        }

        return loginData;
    },

    /**
     * 用户注册
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await request.post<RegisterResponse>('/api/auth/register', data);
        return response.data;
    },

    /**
     * 用户登出
     */
    async logout(): Promise<void> {
        try {
            await request.post('/api/auth/logout');
        } finally {
            tokenStorage.clear();
        }
    },

    /**
     * 获取当前用户信息
     */
    async getCurrentUser(): Promise<UserProfile | null> {
        try {
            const response = await request.get<UserProfile>('/api/user/profile');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * 更新用户信息
     */
    async updateProfile(data: {
        nickname?: string;
        avatarUrl?: string;
        email?: string;
        phone?: string;
    }): Promise<UserProfile> {
        const response = await request.put<UserProfile>('/api/user/profile', data);

        // 更新本地存储的用户信息
        const localUser = this.getLocalUser();
        if (localUser) {
            const updatedUser = {
                ...localUser,
                nickname: data.nickname || localUser.nickname,
                avatarUrl: data.avatarUrl || localUser.avatarUrl,
            };
            tokenStorage.setUser(updatedUser);
        }

        return response.data;
    },

    /**
     * 修改密码
     */
    async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
        await request.put('/api/user/password', data);
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated(): boolean {
        return tokenStorage.isAuthenticated();
    },

    /**
     * 获取本地存储的用户信息
     */
    getLocalUser(): { id: number; username: string; nickname: string; isAdmin: boolean; avatarUrl?: string } | null {
        return tokenStorage.getUser();
    },

    /**
     * 获取 Token
     */
    getToken(): string | null {
        return tokenStorage.getToken();
    },
};
