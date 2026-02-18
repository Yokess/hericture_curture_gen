import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { communityApi, type CommunityPostListItemDTO } from '@/api/community';
import { ExternalLink, Loader2, Pin, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommunityManagement() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<CommunityPostListItemDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sort, setSort] = useState<'latest' | 'popular' | 'likes'>('latest');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const filtered = useMemo(() => {
        const k = searchKeyword.trim().toLowerCase();
        if (!k) return posts;
        return posts.filter((p) => {
            const t = (p.title || '').toLowerCase();
            const a = (p.authorName || '').toLowerCase();
            const c = (p.contentPreview || '').toLowerCase();
            return t.includes(k) || a.includes(k) || c.includes(k);
        });
    }, [posts, searchKeyword]);

    const loadPosts = async (resetPage?: boolean) => {
        const targetPage = resetPage ? 0 : page;
        if (resetPage) setPage(0);
        setLoading(true);
        try {
            const res = await communityApi.listPosts({ sort, page: targetPage, size: 12 });
            setPosts(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (error: any) {
            console.error('加载帖子失败:', error);
            alert('加载失败: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    useEffect(() => {
        loadPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = () => {
        loadPosts(true);
    };

    const togglePinned = async (p: CommunityPostListItemDTO) => {
        try {
            await communityApi.adminPinPost(p.id, !p.isPinned);
            await loadPosts();
        } catch (error: any) {
            alert('操作失败: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (p: CommunityPostListItemDTO) => {
        if (!confirm(`确定要删除帖子「${p.title}」吗？此操作会将帖子标记为删除。`)) return;
        try {
            await communityApi.adminDeletePost(p.id);
            await loadPosts();
        } catch (error: any) {
            alert('删除失败: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">社区管理</h1>
                    <p className="text-gray-600 mt-1">管理社区帖子、置顶与内容治理</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">帖子总数</span>
                    <p className="text-2xl font-bold text-[#8B4513]">{totalElements}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex gap-2 flex-1 min-w-[280px]">
                        <Input
                            placeholder="搜索标题、作者、简介..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-md"
                        />
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">最新</SelectItem>
                                <SelectItem value="popular">最热</SelectItem>
                                <SelectItem value="likes">最多点赞</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => loadPosts()} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                        <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#8B4513]/10 to-[#D4AF37]/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">帖子</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">作者</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">互动</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">标签</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">发布时间</th>
                                    <th className="px-5 py-4 text-right text-sm font-semibold text-[#8B4513]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            暂无帖子数据
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[#8B4513]/12 to-[#D4AF37]/12 ring-1 ring-black/5 shrink-0">
                                                        {p.coverUrl ? (
                                                            <img src={p.coverUrl} alt={p.title} className="w-full h-full object-cover" />
                                                        ) : null}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-gray-900 truncate max-w-[360px]">{p.title}</div>
                                                            {p.isPinned ? (
                                                                <Badge className="bg-[#8B4513] text-white border-0">置顶</Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-sm text-gray-500 line-clamp-1 max-w-[420px]">
                                                            {p.contentPreview || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Avatar className="h-9 w-9 mr-3">
                                                        <AvatarImage src={p.authorAvatarUrl || undefined} />
                                                        <AvatarFallback className="bg-[#8B4513]/10 text-[#8B4513]">
                                                            {(p.authorName || 'U').slice(0, 1).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate max-w-[180px]">{p.authorName}</div>
                                                        <div className="text-xs text-gray-500">ID: {p.userId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="space-y-1">
                                                    <div>👍 {p.likeCount}</div>
                                                    <div>👁 {p.viewCount}</div>
                                                    <div>💬 {p.commentCount}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {(p.tags || []).slice(0, 3).map((t) => (
                                                        <Badge key={t} variant="secondary" className="bg-[#F5F5DC] text-[#8B4513] text-xs">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(p.createdAt).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/10"
                                                        title="查看帖子"
                                                        onClick={() => navigate(`/community/${p.id}`)}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={p.isPinned ? 'text-[#8B4513] hover:bg-[#8B4513]/10' : 'text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/10'}
                                                        title={p.isPinned ? '取消置顶' : '置顶'}
                                                        onClick={() => togglePinned(p)}
                                                    >
                                                        <Pin className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="删除帖子"
                                                        onClick={() => handleDelete(p)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            当前显示 {filtered.length} 条，本页共 {posts.length} 条，总计 {totalElements} 条
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                                上一页
                            </Button>
                            <span className="flex items-center px-2 text-sm text-gray-600">
                                第 {page + 1} / {totalPages} 页
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

