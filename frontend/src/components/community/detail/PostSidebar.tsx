import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type CommunityPostDetailDTO } from '@/api/community';

interface PostSidebarProps {
    post: CommunityPostDetailDTO;
    onLike: () => void;
    onCollect: () => void;
}

export function PostSidebar({ post, onLike, onCollect }: PostSidebarProps) {
    const copyPrompt = () => {
        if (post.remixPrompt) {
            navigator.clipboard.writeText(post.remixPrompt);
            alert('提示词已复制到剪贴板');
        }
    };

    return (
        <>
            {/* 作者卡片 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#D4AF37] to-[#8B4513] rounded-full opacity-30 blur-sm" />
                        <Avatar className="w-14 h-14 border-2 border-white relative">
                            <AvatarImage src={post.authorAvatarUrl || undefined} />
                            <AvatarFallback className="bg-[#8B4513] text-white">
                                {post.authorName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-900">{post.authorName}</div>
                        <div className="text-sm text-gray-500">资深非遗设计师</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        size="lg" 
                        variant="outline"
                        className={cn(
                            "w-full transition-all duration-300 border-gray-200 hover:border-[#8B4513] hover:text-[#8B4513]",
                            post.liked && "bg-[#8B4513] text-white hover:bg-[#8B4513]/90 hover:text-white border-transparent"
                        )}
                        onClick={onLike}
                    >
                        <Heart className={cn("w-5 h-5 mr-2", post.liked && "fill-current")} />
                        {post.likeCount}
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className={cn(
                            "w-full transition-all duration-300 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]",
                            post.collected && "bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90 hover:text-white border-transparent"
                        )}
                        onClick={onCollect}
                    >
                        <Bookmark className={cn("w-5 h-5 mr-2", post.collected && "fill-current")} />
                        收藏
                    </Button>
                </div>
            </div>

            {/* 提示词区域 */}
            <div className="bg-gradient-to-b from-[#FFFDF5] to-white rounded-2xl p-6 shadow-sm border border-[#D4AF37]/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#8B4513] font-serif font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>创作提示词</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[#8B4513]/80 hover:text-[#8B4513]" onClick={copyPrompt}>
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> 复制
                    </Button>
                </div>

                {post.remixPrompt ? (
                    <div className="relative group">
                        <div className="bg-[#2C1810]/5 rounded-xl p-4 text-sm text-[#5D4037] font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                            {post.remixPrompt}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        作者隐藏了提示词
                    </div>
                )}
            </div>

            {/* 分享/更多操作 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>浏览量 {post.viewCount}</span>
                <Button variant="ghost" size="sm" className="text-gray-600">
                    <Share2 className="w-4 h-4 mr-2" /> 分享作品
                </Button>
            </div>
        </>
    );
}