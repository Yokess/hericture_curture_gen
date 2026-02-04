import { useAuth } from '@/hooks/useAuth';
import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdminHeader() {
    const { user, logout } = useAuth();

    // 获取用户名首字母作为头像占位符
    const getAvatarFallback = () => {
        if (user?.nickname) {
            return user.nickname.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'A';
    };

    return (
        <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-8 shadow-sm">
            {/* Search Bar (Placeholder) */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="搜索功能、用户或内容..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900">{user?.nickname || user?.username || '管理员'}</p>
                                <p className="text-xs text-gray-500">超级管理员</p>
                            </div>
                            <Avatar className="w-9 h-9 border border-gray-200">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="bg-[#8B4513] text-white">
                                    {getAvatarFallback()}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>个人设置</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
