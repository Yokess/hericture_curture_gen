import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkCard } from '@/components/community/WorkCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { communityApi, type CommunityPostListItemDTO } from '@/api/community';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

export default function Community() {
    const [posts, setPosts] = useState<CommunityPostListItemDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedSort, setSelectedSort] = useState<'latest' | 'popular' | 'likes'>('latest');
    const [keyword, setKeyword] = useState('');

    const filteredPosts = useMemo(() => {
        const k = keyword.trim().toLowerCase();
        if (!k) return posts;
        return posts.filter((p) => (p.title || '').toLowerCase().includes(k) || (p.contentPreview || '').toLowerCase().includes(k) || (p.authorName || '').toLowerCase().includes(k));
    }, [posts, keyword]);

    const loadPosts = async (nextPage: number, reset: boolean) => {
        setLoading(true);
        try {
            const res = await communityApi.listPosts({
                sort: selectedSort,
                page: nextPage,
                size: 12,
            });
            const data = res.data;
            setTotalPages(data.totalPages || 0);
            setPage(data.number || 0);
            setPosts((prev) => (reset ? data.content : [...prev, ...(data.content || [])]));
        } catch (e) {
            console.error('加载社区帖子失败:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort]);

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 页面标题 */}
            <section className="pt-32 pb-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-br from-white/70 to-[#F5F5DC] shadow-sm px-6 py-10 md:px-10">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#8B4513] mb-3">创意分享社区</h1>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl">
                            发布你的设计作品，浏览灵感，收藏同款提示词，和更多非遗爱好者一起把传统做成“当代”。
                        </p>
                        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center">
                            <div className="relative w-full md:max-w-md">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="搜索标题 / 作者 / 简介…"
                                    className="pl-9 bg-white/80"
                                />
                            </div>
                            <div className="flex items-center gap-3 justify-between w-full md:w-auto">
                                <Select value={selectedSort} onValueChange={(v: any) => setSelectedSort(v)}>
                                    <SelectTrigger className="w-32 bg-white/80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">最新</SelectItem>
                                        <SelectItem value="popular">最热</SelectItem>
                                        <SelectItem value="likes">最多点赞</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-gray-500 md:hidden">
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            加载中…
                                        </span>
                                    ) : (
                                        <span>共 {filteredPosts.length} 条</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 hidden md:block text-xs text-gray-500">
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    加载中…
                                </span>
                            ) : (
                                <span>共 {filteredPosts.length} 条</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 作品瀑布流 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {filteredPosts.length === 0 && !loading ? (
                        <div className="text-center py-20 text-gray-500">
                            暂无内容，去 AI 设计页发布你的第一条作品吧。
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((p) => (
                                <WorkCard
                                    key={p.id}
                                    id={p.id}
                                    title={p.title}
                                    authorName={p.authorName}
                                    authorAvatarUrl={p.authorAvatarUrl}
                                    likeCount={p.likeCount}
                                    viewCount={p.viewCount}
                                    commentCount={p.commentCount}
                                    tags={p.tags}
                                    isPinned={p.isPinned}
                                    coverUrl={p.coverUrl}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-10">
                        <Button
                            variant="outline"
                            disabled={loading || page + 1 >= totalPages}
                            onClick={() => loadPosts(page + 1, false)}
                            className="bg-white/70"
                        >
                            {page + 1 >= totalPages ? '没有更多了' : '加载更多'}
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
