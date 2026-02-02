/**
 * Token 存储管理工具
 * 负责 Token 的存储、获取和清除
 */

const TOKEN_KEY = 'heritage_auth_token';
const USER_KEY = 'heritage_user_info';

export const tokenStorage = {
    /**
     * 保存 Token
     */
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * 获取 Token
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * 移除 Token
     */
    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * 保存用户信息
     */
    setUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * 获取用户信息
     */
    getUser(): any | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    /**
     * 移除用户信息
     */
    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    },

    /**
     * 清除所有认证信息
     */
    clear(): void {
        this.removeToken();
        this.removeUser();
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
