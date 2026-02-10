import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Database,
    MessageSquare,
    Home,
    LogOut,
    Landmark,
    UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function AdminSidebar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: '概况' },
        { path: '/admin/users', icon: Users, label: '用户管理' },
        { path: '/admin/heritage-projects', icon: Landmark, label: '非遗项目' },
        { path: '/admin/successors', icon: UserCheck, label: '传承人管理' },
        { path: '/admin/knowledge-base', icon: Database, label: '知识库管理' },
        { path: '/admin/community', icon: MessageSquare, label: '社区管理' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1a1c23] text-white flex flex-col z-40">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-700 bg-[#15171e]">
                <div className="w-8 h-8 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-lg flex items-center justify-center mr-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="font-bold text-lg tracking-wide">非遗管理后台</span>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group",
                                isActive
                                    ? "bg-[#8B4513] text-white shadow-md"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-700 space-y-2 bg-[#15171e]">
                <button
                    onClick={() => navigate('/')}
                    className="flex w-full items-center px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                    <Home className="w-5 h-5 mr-3" />
                    <span>返回前台</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>退出登录</span>
                </button>
            </div>
        </aside>
    );
}
