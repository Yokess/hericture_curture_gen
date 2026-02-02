import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// 本地用户信息类型
interface LocalUser {
    id: number;
    username: string;
    nickname: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: LocalUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: { username: string; password: string }) => Promise<void>;
    register: (data: { username: string; password: string; email?: string; nickname?: string }) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证上下文 Provider
 * 在应用根组件中使用，提供全局用户状态
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * 使用认证上下文 Hook
 * 
 * 用法：
 * ```typescript
 * import { useAuthContext } from '@/contexts/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuthContext();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginButton onClick={() => login({ username, password })} />;
 *   }
 *   
 *   return <div>Welcome, {user?.nickname}!</div>;
 * }
 * ```
 */
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
