import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useAuth();

    // 权限检查 - 等待加载完成后再检查
    useEffect(() => {
        if (loading) {
            return; // 加载中，不做任何操作
        }

        if (!isAuthenticated) {
            console.log('未登录，重定向到登录页');
            navigate('/login');
        } else if (!user?.isAdmin) {
            console.log('非管理员，重定向到首页');
            navigate('/');
        }
    }, [isAuthenticated, user, navigate, loading]);

    // 加载中显示加载状态
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    // 未登录或非管理员，返回 null（等待重定向）
    if (!isAuthenticated || !user?.isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <AdminHeader />

            <div className="flex">
                {/* 侧边栏 */}
                <AdminSidebar />

                {/* 主内容区 */}
                <main className="flex-1 p-8 ml-64 mt-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
