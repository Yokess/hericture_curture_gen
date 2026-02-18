import { Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkCard } from '@/components/community/WorkCard';
import { type CommunityPostListItemDTO } from '@/api/community';

interface CommunityListProps {
    posts: CommunityPostListItemDTO[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

export function CommunityList({ posts, loading, hasMore, onLoadMore }: CommunityListProps) {
    
    // 空状态
    if (!loading && posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
                    <Palette className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">暂无相关作品</h3>
                <p className="text-gray-500 max-w-sm mb-8">
                    看起来这片领域还是处女地。为什么不成为第一个开拓者呢？
                </p>
                <Button className="bg-[#8B4513] hover:bg-[#8B4513]/90 text-white">
                    发布第一条作品
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
            {/* 网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post, index) => (
                    <div 
                        key={`${post.id}-${index}`}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <WorkCard
                            id={post.id}
                            title={post.title}
                            authorName={post.authorName}
                            authorAvatarUrl={post.authorAvatarUrl}
                            likeCount={post.likeCount}
                            viewCount={post.viewCount}
                            commentCount={post.commentCount}
                            tags={post.tags}
                            isPinned={post.isPinned}
                            coverUrl={post.coverUrl}
                        />
                    </div>
                ))}
                
                {/* 加载占位符 (Skeleton) */}
                {loading && Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="space-y-3">
                        <div className="aspect-[4/5] bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-16">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        className="h-12 px-8 rounded-full border-gray-300 text-gray-600 hover:border-[#8B4513] hover:text-[#8B4513] bg-white/50 backdrop-blur-sm transition-all"
                    >
                        加载更多灵感
                    </Button>
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="text-center mt-16 text-gray-400 text-sm flex items-center justify-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    已展示全部内容
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                </div>
            )}
        </div>
    );
}