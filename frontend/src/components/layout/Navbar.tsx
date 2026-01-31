import { Link, useLocation } from 'react-router-dom';
import { Home, Book, Sparkles, Video, Users } from 'lucide-react';

export function Navbar() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: '首页' },
        { path: '/projects', icon: Book, label: '非遗探索' },
        { path: '/ai-design', icon: Sparkles, label: 'AI设计' },
        { path: '/video-archive', icon: Video, label: '视频档案' },
        { path: '/community', icon: Users, label: '创意社区' },
    ];

    const isActive = (path: string) => location.pathname === path;

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

                        {/* CTA Buttons */}
                        <div className="flex items-center space-x-4">
                            <button className="hidden sm:block px-4 py-2 text-[#8B4513] hover:bg-[#F5F5DC] rounded-lg transition-colors duration-200">
                                登录
                            </button>
                            <button className="px-5 py-2 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                                开始探索
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
