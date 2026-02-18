import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { communityApi, type CommunityPostListItemDTO } from '@/api/community';

// 引入拆分后的组件
import { CommunityHero } from '@/components/community/CommunityHero';
import { CommunityFilterBar } from '@/components/community/CommunityFilterBar';
import { CommunityList } from '@/components/community/CommunityList';

export default function Community() {
    const navigate = useNavigate();
    
    // --- 状态管理 ---
    const [posts, setPosts] = useState<CommunityPostListItemDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // 筛选状态
    const [selectedSort, setSelectedSort] = useState<'latest' | 'popular' | 'likes'>('latest');
    const [keyword, setKeyword] = useState('');

    // --- 数据获取 ---
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
            setTotalElements(data.totalElements || 0);
            setPage(data.number || 0);
            
            setPosts((prev) => (reset ? data.content : [...prev, ...(data.content || [])]));
        } catch (e) {
            console.error('加载社区帖子失败:', e);
        } finally {
            setLoading(false);
        }
    };

    // 监听排序变化，重置列表
    useEffect(() => {
        loadPosts(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort]);

    // 前端搜索过滤 (如果后端 API 支持搜索，建议改为调用 API)
    const filteredPosts = useMemo(() => {
        const k = keyword.trim().toLowerCase();
        if (!k) return posts;
        return posts.filter((p) => 
            (p.title || '').toLowerCase().includes(k) || 
            (p.contentPreview || '').toLowerCase().includes(k) || 
            (p.authorName || '').toLowerCase().includes(k)
        );
    }, [posts, keyword]);

    const handleLoadMore = () => {
        if (page + 1 < totalPages) {
            loadPosts(page + 1, false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] selection:bg-[#D4AF37]/30">
            <Navbar />

            <main>
                {/* 1. 沉浸式头部 */}
                <CommunityHero 
                    totalCount={totalElements} 
                    onStartCreate={() => navigate('/ai-design')} 
                />

                {/* 2. 悬浮筛选栏 */}
                <CommunityFilterBar 
                    keyword={keyword}
                    setKeyword={setKeyword}
                    sort={selectedSort}
                    setSort={setSelectedSort}
                    className="-mt-8" // 负边距让筛选栏稍微盖住 Hero 区域，增加层次感
                />

                {/* 3. 瀑布流列表 */}
                <div className="mt-8">
                    <CommunityList 
                        posts={filteredPosts} 
                        loading={loading} 
                        hasMore={page + 1 < totalPages}
                        onLoadMore={handleLoadMore}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}