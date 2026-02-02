import { useState, useEffect, useCallback } from 'react';
import { authApi, type LoginResponse } from '@/api/auth';
import type { LoginRequest, RegisterRequest } from '@/api/auth';

// 本地用户信息类型
interface LocalUser {
    id: number;
    username: string;
    nickname: string;
    isAdmin: boolean;
    avatarUrl?: string; // 用户头像 URL(可选)
    email?: string; // 邮箱(可选)
    phone?: string; // 手机号(可选)
}

interface UseAuthReturn {
    user: LocalUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

/**
 * 认证 Hook
 * 管理用户登录状态、登录、注册、登出等功能
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [loading, setLoading] = useState(true);

    // 获取当前用户信息
    const fetchUser = useCallback(async () => {
        if (!authApi.isAuthenticated()) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // 优先从本地存储获取
            const localUser = authApi.getLocalUser();
            if (localUser) {
                setUser(localUser);
                setLoading(false);

                // 后台异步验证 token 有效性（不阻塞 UI）
                authApi.getCurrentUser().catch((error) => {
                    console.warn('Token 验证失败，可能已过期:', error);
                    // 如果 token 无效，清除用户信息
                    setUser(null);
                    authApi.logout();
                });
            } else {
                // 如果本地没有，从服务器获取
                const currentUser = await authApi.getCurrentUser();
                if (currentUser) {
                    setUser({
                        id: currentUser.id,
                        username: currentUser.username,
                        nickname: currentUser.nickname,
                        isAdmin: currentUser.isAdmin || false,
                        avatarUrl: currentUser.avatarUrl,
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            setUser(null);
            setLoading(false);
        }
    }, []);

    // 初始化时获取用户信息
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // 登录
    const login = async (data: LoginRequest) => {
        setLoading(true);
        try {
            const response: LoginResponse = await authApi.login(data);
            // 设置用户信息
            setUser({
                id: response.userId,
                username: response.username,
                nickname: response.nickname,
                isAdmin: response.isAdmin,
                avatarUrl: response.avatarUrl,
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    // 注册
    const register = async (data: RegisterRequest) => {
        setLoading(true);
        try {
            await authApi.register(data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    // 登出
    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser: fetchUser,
    };
}

