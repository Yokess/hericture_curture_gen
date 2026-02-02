import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Users, ExternalLink, Loader2 } from 'lucide-react';
import { heritageApi, type ProjectDetail } from '@/api/heritage';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取项目详情
    useEffect(() => {
        const fetchProjectDetail = async () => {
            if (!id) {
                setError('项目ID不存在');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await heritageApi.getProjectDetail(Number(id));
                setProject(data);
            } catch (err: any) {
                setError(err.message || '加载失败');
                console.error('获取项目详情失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetail();
    }, [id]);

    // 加载状态
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5DC]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                    <span className="ml-2 text-gray-600">加载中...</span>
                </div>
                <Footer />
            </div>
        );
    }

    // 错误状态
    if (error || !project) {
        return (
            <div className="min-h-screen bg-[#F5F5DC]">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <p className="text-red-600 mb-4">{error || '项目不存在'}</p>
                    <Button
                        onClick={() => navigate('/projects')}
                        className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                    >
                        返回项目列表
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 返回按钮 */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/projects')}
                        className="mb-6 text-[#8B4513] hover:text-[#8B4513]/80 hover:bg-[#8B4513]/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回项目列表
                    </Button>
                </div>
            </section>

            {/* 项目详情 */}
            <section className="pb-12 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* 项目头部 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] p-8 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm opacity-90 mb-2">{project.officialId}</div>
                                    <h1 className="font-serif text-4xl font-bold mb-4">{project.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {project.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {project.batch}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            {project.successors.length} 位传承人
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <div className="text-xs opacity-90">类别</div>
                                    <div className="font-semibold">{project.category}</div>
                                </div>
                            </div>
                        </div>

                        {/* 项目描述 */}
                        <div className="p-8">
                            <h2 className="font-serif text-2xl font-bold text-[#8B4513] mb-4">项目简介</h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {project.description}
                            </div>

                            {/* 官方链接 */}
                            {project.officialUrl && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <a
                                        href={project.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-[#8B4513] hover:text-[#8B4513]/80 font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        查看官方详情
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 传承人列表 */}
                    {project.successors.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#8B4513]/10 to-[#D4AF37]/10 p-6 border-b border-gray-200">
                                <h2 className="font-serif text-2xl font-bold text-[#8B4513]">
                                    代表性传承人 ({project.successors.length})
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {project.successors.map((successor) => (
                                        <div
                                            key={successor.id}
                                            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-[#D4AF37]/20 hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <h3 className="font-bold text-2xl text-[#8B4513]">
                                                        {successor.name}
                                                    </h3>
                                                    {successor.gender && (
                                                        <span className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                                                            {successor.gender}
                                                        </span>
                                                    )}
                                                    {successor.birthYear && (
                                                        <div className="text-sm text-gray-600 flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {successor.birthYear}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="text-sm text-gray-700 bg-white/50 rounded-lg p-4">
                                                    <div className="font-medium text-[#8B4513] mb-2">传承项目</div>
                                                    <div className="text-base">{successor.projectName}</div>
                                                </div>

                                                {successor.officialUrl && (
                                                    <div className="flex items-center justify-end">
                                                        <a
                                                            href={successor.officialUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-sm text-[#8B4513] hover:text-[#8B4513]/80 font-medium bg-white/70 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            查看官方详情
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {successor.description && (
                                                <div className="text-sm text-gray-700 bg-white/70 rounded-lg p-4 leading-relaxed">
                                                    <div className="font-medium text-[#8B4513] mb-2">生平简介</div>
                                                    <div className="whitespace-pre-wrap">
                                                        {successor.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 无传承人提示 */}
                    {project.successors.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 p-8 text-center">
                            <p className="text-gray-600">暂无代表性传承人信息</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
