import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Book, Loader2 } from 'lucide-react';
import { QASection } from '@/components/projects/QASection';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { heritageApi, type ProjectListItem, type PageResponse } from '@/api/heritage';

export default function Projects() {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [location, setLocation] = useState('all');
    const [batch, setBatch] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(12);

    // 数据状态
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [pageData, setPageData] = useState<PageResponse<ProjectListItem> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取项目列表
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            let response: PageResponse<ProjectListItem>;

            if (searchQuery) {
                // 搜索模式
                response = await heritageApi.searchProjects(searchQuery, currentPage, pageSize);
            } else {
                // 列表模式
                const params: any = {
                    page: currentPage,
                    size: pageSize,
                };

                if (category !== 'all') {
                    params.category = category;
                }

                if (location !== 'all') {
                    params.location = location;
                }

                response = await heritageApi.listProjects(params);
            }

            setProjects(response.content);
            setPageData(response);
        } catch (err: any) {
            setError(err.message || '加载失败');
            console.error('获取项目列表失败:', err);
        } finally {
            setLoading(false);
        }
    };

    // 监听筛选条件变化
    useEffect(() => {
        setCurrentPage(0); // 重置到第一页
    }, [searchQuery, category, location, batch]);

    // 监听页码和筛选条件变化
    useEffect(() => {
        fetchProjects();
    }, [currentPage, searchQuery, category, location]);

    // 分页处理
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 生成分页按钮
    const renderPagination = () => {
        if (!pageData) return null;

        const { number, totalPages } = pageData;
        const pages: number[] = [];

        // 显示当前页前后2页
        const start = Math.max(0, number - 2);
        const end = Math.min(totalPages - 1, number + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return (
            <div className="mt-8 flex items-center justify-center space-x-2">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(number - 1)}
                    disabled={number === 0 || loading}
                >
                    上一页
                </Button>

                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === number ? 'default' : 'outline'}
                        className={page === number ? 'bg-[#8B4513] hover:bg-[#8B4513]/90' : ''}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                    >
                        {page + 1}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    onClick={() => handlePageChange(number + 1)}
                    disabled={number >= totalPages - 1 || loading}
                >
                    下一页
                </Button>

                <span className="ml-4 text-sm text-gray-600">
                    共 {pageData.totalElements} 个项目，{pageData.totalPages} 页
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 页面标题 */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">非遗探索中心</h1>
                    <p className="text-xl text-gray-600">智能问答 + 项目浏览,全方位了解非遗文化</p>
                </div>
            </section>

            {/* 标签页切换 */}
            <section className="pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="qa" className="w-full">
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 overflow-hidden">
                            {/* 标签页头部 */}
                            <TabsList className="w-full grid grid-cols-2 h-auto p-0 bg-transparent border-b border-gray-200">
                                <TabsTrigger
                                    value="qa"
                                    className="flex items-center justify-center space-x-2 px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#8B4513] data-[state=active]:text-[#8B4513] data-[state=active]:bg-transparent"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-semibold">智能问答</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="projects"
                                    className="flex items-center justify-center space-x-2 px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#8B4513] data-[state=active]:text-[#8B4513] data-[state=active]:bg-transparent"
                                >
                                    <Book className="w-5 h-5" />
                                    <span className="font-semibold">项目浏览</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* 智能问答内容 */}
                            <TabsContent value="qa" className="m-0">
                                <QASection />
                            </TabsContent>

                            {/* 项目浏览内容 */}
                            <TabsContent value="projects" className="m-0 p-6">
                                {/* 搜索和筛选 */}
                                <ProjectFilters
                                    onSearchChange={setSearchQuery}
                                    onCategoryChange={setCategory}
                                    onLocationChange={setLocation}
                                    onBatchChange={setBatch}
                                />

                                {/* 加载状态 */}
                                {loading && (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                                        <span className="ml-2 text-gray-600">加载中...</span>
                                    </div>
                                )}

                                {/* 错误状态 */}
                                {error && (
                                    <div className="text-center py-12">
                                        <p className="text-red-600">{error}</p>
                                        <Button
                                            onClick={fetchProjects}
                                            className="mt-4 bg-[#8B4513] hover:bg-[#8B4513]/90"
                                        >
                                            重试
                                        </Button>
                                    </div>
                                )}

                                {/* 项目列表 */}
                                {!loading && !error && projects && projects.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {projects.map((project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    id={project.id.toString()}
                                                    code={project.officialId}
                                                    batch={project.batch}
                                                    name={project.name}
                                                    category={project.category}
                                                    location={project.location}
                                                    description="" // 列表不显示描述
                                                    successorCount={project.successorCount}
                                                    categoryIcon={getCategoryIcon(project.category)}
                                                    gradient={getCategoryGradient(project.category)}
                                                />
                                            ))}
                                        </div>

                                        {/* 分页 */}
                                        {renderPagination()}
                                    </>
                                )}

                                {/* 空状态 */}
                                {!loading && !error && (!projects || projects.length === 0) && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">暂无项目数据</p>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </section>

            <Footer />
        </div>
    );
}

// 辅助函数:根据类别获取图标
function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
        '民间文学': '📖',
        '传统音乐': '🎵',
        '传统舞蹈': '💃',
        '传统戏剧': '🎭',
        '曲艺': '🎤',
        '传统体育、游艺与杂技': '🤸',
        '传统美术': '🎨',
        '传统技艺': '🏺',
        '传统医药': '💊',
        '民俗': '🏮',
    };
    return iconMap[category] || '📜';
}

// 辅助函数:根据类别获取渐变色
function getCategoryGradient(category: string): string {
    const gradientMap: Record<string, string> = {
        '民间文学': 'bg-gradient-to-br from-red-50 to-pink-50',
        '传统音乐': 'bg-gradient-to-br from-purple-50 to-indigo-50',
        '传统舞蹈': 'bg-gradient-to-br from-pink-50 to-rose-50',
        '传统戏剧': 'bg-gradient-to-br from-yellow-50 to-amber-50',
        '曲艺': 'bg-gradient-to-br from-green-50 to-emerald-50',
        '传统体育、游艺与杂技': 'bg-gradient-to-br from-cyan-50 to-sky-50',
        '传统美术': 'bg-gradient-to-br from-orange-50 to-yellow-50',
        '传统技艺': 'bg-gradient-to-br from-blue-50 to-blue-100',
        '传统医药': 'bg-gradient-to-br from-teal-50 to-green-50',
        '民俗': 'bg-gradient-to-br from-amber-50 to-orange-50',
    };
    return gradientMap[category] || 'bg-gradient-to-br from-gray-50 to-gray-100';
}
