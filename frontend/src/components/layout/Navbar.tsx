import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Book, Sparkles, Video, Users, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const navItems = [
        { path: '/', icon: Home, label: '首页' },
        { path: '/projects', icon: Book, label: '非遗探索' },
        { path: '/ai-design', icon: Sparkles, label: 'AI设计' },
        { path: '/video-archive', icon: Video, label: '视频档案' },
        { path: '/community', icon: Users, label: '创意社区' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // 获取用户名首字母作为头像占位符
    const getAvatarFallback = () => {
        if (user?.nickname) {
            return user.nickname.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="fixed top-4 left-4 right-4 z-50">
            <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-border">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
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
                            <span className="font-serif text-xl font-bold text-[#8B4513]">
                                非遗文化平台
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 transition-colors duration-200 ${isActive(item.path)
                                            ? 'text-[#8B4513] font-medium'
                                            : 'text-gray-600 hover:text-[#8B4513]'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Section */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && user ? (
                                // 已登录 - 显示用户头像和下拉菜单
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center space-x-3 hover:bg-[#F5F5DC] rounded-lg px-3 py-2 transition-colors duration-200">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.avatarUrl} alt={user.nickname || user.username} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#8B4513] to-[#D4AF37] text-white">
                                                    {getAvatarFallback()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="hidden sm:block text-sm font-medium text-[#8B4513]">
                                                {user.nickname || user.username}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium">{user.nickname || user.username}</p>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>个人中心</span>
                                        </DropdownMenuItem>
                                        {user.isAdmin && (
                                            <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>后台管理</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>设置</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>退出登录</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                // 未登录 - 显示登录按钮
                                <>
                                    <Link
                                        to="/login"
                                        className="hidden sm:block px-4 py-2 text-[#8B4513] hover:bg-[#F5F5DC] rounded-lg transition-colors duration-200"
                                    >
                                        登录
                                    </Link>
                                    <button className="px-5 py-2 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                                        开始探索
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
