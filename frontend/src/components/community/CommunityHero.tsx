import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunityHeroProps {
    totalCount: number;
    onStartCreate: () => void;
}

export function CommunityHero({ totalCount, onStartCreate }: CommunityHeroProps) {
    return (
        <div className="relative w-full overflow-hidden bg-[#F5F5DC] pt-32 pb-16 px-4 md:px-8">
            {/* 背景装饰：光晕与纹理 */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8B4513]/5 rounded-full blur-[80px]" />
                {/* 噪点纹理叠加 */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            <div className="relative max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="max-w-3xl">
                        <Badge variant="outline" className="mb-6 border-[#8B4513]/30 text-[#8B4513] px-3 py-1 uppercase tracking-widest text-xs font-bold bg-white/50 backdrop-blur-sm">
                            Showcase & Inspiration
                        </Badge>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#2C1810] leading-[1.1] mb-6">
                            让传统文化 <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8B4513]">
                                此刻发生
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                            探索 {totalCount > 0 ? totalCount : '...'} 个由 AI 赋能的非遗再设计方案。
                            在这里，古老的技艺通过现代审美重获新生。
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px]">
                        <Button 
                            size="lg" 
                            onClick={onStartCreate}
                            className="bg-[#8B4513] hover:bg-[#8B4513]/90 text-white shadow-lg shadow-[#8B4513]/20 h-14 px-8 rounded-full text-lg group transition-all duration-300 hover:-translate-y-1"
                        >
                            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                            开始创作
                        </Button>
                        <p className="text-xs text-gray-400 text-center">
                            基于 RAG 引擎与扩散模型
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
