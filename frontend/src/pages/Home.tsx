import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/home/StatCard';
import { FeatureCard } from '@/components/home/FeatureCard';
import { Book, Users, Palette, Video, MessageSquare, Sparkles, Play, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/10 via-[#D4AF37]/5 to-transparent" />
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-[#8B4513] rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#8B4513] mb-6 leading-tight">
                        传承非遗文化
                        <br />
                        <span className="text-[#D4AF37]">创新未来设计</span>
                    </h1>
                    <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                        融合 RAG 技术与扩散模型,为您提供智能非遗问答、AI 文创设计、技艺数字化档案和创意分享社区
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center justify-center space-x-4 mb-12">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-xl transition-all duration-200 text-lg px-8 py-6"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            开始创作
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-all duration-200 text-lg px-8 py-6"
                        >
                            <Play className="w-5 h-5 mr-2" />
                            观看介绍
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <StatCard
                            icon={Book}
                            value="1,557"
                            label="非遗项目"
                            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <StatCard
                            icon={Palette}
                            value="8,234"
                            label="用户作品"
                            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                        />
                        <StatCard
                            icon={Users}
                            value="3,068"
                            label="代表性传承人"
                            gradient="bg-gradient-to-br from-green-500 to-green-600"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl font-bold text-[#8B4513] mb-4">
                            核心功能
                        </h2>
                        <p className="text-gray-600 text-lg">
                            四大智能模块,全方位助力非遗文化传承与创新
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={MessageSquare}
                            title="智能问答"
                            description="基于 RAG 技术的非遗知识库,专业解答您的疑问,提供可溯源的权威信息"
                            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                            link="/projects"
                        />
                        <FeatureCard
                            icon={Sparkles}
                            title="AI 设计"
                            description="扩散模型驱动的文创设计工作站,将传统元素融入现代设计,激发无限创意"
                            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                            link="/ai-design"
                        />
                        <FeatureCard
                            icon={Video}
                            title="视频档案"
                            description="技艺视频智能解析,自动提取工序步骤,数字化保存珍贵的非遗技艺"
                            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                            link="/video-archive"
                        />
                        <FeatureCard
                            icon={Heart}
                            title="创意社区"
                            description="分享您的文创作品,与全国非遗爱好者交流,共同传承中华文化"
                            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                            link="/community"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Works Section */}
            <section className="py-20 px-4 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl font-bold text-[#8B4513] mb-4">
                            精选作品
                        </h2>
                        <p className="text-gray-600 text-lg">
                            用户使用 AI 设计工具创作的优秀文创作品
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                            >
                                <div className="aspect-square bg-gradient-to-br from-[#8B4513]/20 to-[#D4AF37]/20 flex items-center justify-center">
                                    <Palette className="w-16 h-16 text-[#8B4513]/40" />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-serif text-lg font-bold text-[#8B4513] mb-2">
                                        景德镇青花瓷纹样设计
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        融合传统青花瓷元素与现代几何美学
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full" />
                                            <span className="text-sm text-gray-600">用户{i}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-gray-500">
                                            <Heart className="w-4 h-4" />
                                            <span className="text-sm">{128 + i * 10}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
