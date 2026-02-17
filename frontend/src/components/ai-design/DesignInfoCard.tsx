import { Card } from '@/components/ui/card';
import { BookOpen, Sparkles, Wand2, Palette, Ruler, MousePointerClick, Hammer, CheckCircle2 } from 'lucide-react';
import { DesignProject } from '@/types/design';

interface DesignInfoCardProps {
    project: DesignProject | null;
}

export function DesignInfoCard({ project }: DesignInfoCardProps) {
    if (!project) return null;

    return (
        <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 pb-4">
                <BookOpen className="w-6 h-6 text-[#8B4513]" />
                <h2 className="font-serif text-2xl font-bold text-[#8B4513]">设计白皮书</h2>
            </div>

            {/* 文化背景 & 设计理念 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        文化溯源
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed bg-[#F5F5DC]/50 p-4 rounded-lg">
                        {project.culturalContext}
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                        <Wand2 className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        设计哲学
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed bg-[#F5F5DC]/50 p-4 rounded-lg">
                        {project.designPhilosophy}
                    </p>
                </div>
            </div>

            {/* 核心参数：CMF */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Palette className="w-4 h-4 mr-2 text-[#D4AF37]" />
                    CMF 方案 (Color, Material, Finish)
                </h3>
                
                {/* 材质列表 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {project.materials?.map((mat, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-sm font-bold text-gray-800">{mat.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{mat.finish}</div>
                        </div>
                    ))}
                </div>

                {/* 色彩方案 */}
                <div className="flex space-x-4">
                    {project.colors?.map((color, i) => (
                        <div key={i} className="text-center group">
                            <div 
                                className="w-12 h-12 rounded-full shadow-sm mb-2 border-2 border-white ring-1 ring-gray-200 group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-gray-500 block">{color.name}</span>
                            <span className="text-[10px] text-gray-400 block uppercase">{color.hex}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 规格与交互 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8 border-t border-gray-100 pt-6">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        规格形态
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span>尺寸</span>
                            <span className="font-medium text-[#8B4513]">{project.dimensions}</span>
                        </div>
                        <div>
                            <span className="block mb-1">外观特征:</span>
                            <p className="bg-gray-50 p-2 rounded text-gray-500 text-xs">
                                {project.formFactor}
                            </p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <MousePointerClick className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        交互体验
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {project.userInteraction}
                    </p>
                </div>
            </div>

            {/* 关键特性 */}
            <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <Hammer className="w-4 h-4 mr-2 text-[#D4AF37]" />
                    核心功能点
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.keyFeatures?.map((feature, i) => (
                        <div key={i} className="flex items-start">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}