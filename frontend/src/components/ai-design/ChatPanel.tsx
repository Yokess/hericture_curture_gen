import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Wand2,
    PenTool,
    Sparkles,
    Palette,
    Scan,
    MousePointerClick,
    Camera
} from 'lucide-react';
import { translateToDesignConcept } from '@/services/geminiService';
import { DesignProject } from '@/types/design';

interface ChatPanelProps {
    onProjectGenerated?: (project: DesignProject) => void;
    onGenerateVisuals?: () => void;
    isGeneratingImg?: boolean;
}

export function ChatPanel({
    onProjectGenerated,
    onGenerateVisuals,
    isGeneratingImg = false
}: ChatPanelProps) {
    const [idea, setIdea] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [project, setProject] = useState<DesignProject | null>(null);

    const handleTranslate = async () => {
        if (!idea.trim()) return;
        setIsTranslating(true);
        try {
            const concept = await translateToDesignConcept(idea);
            const newProject = {
                id: Date.now().toString(),
                ...concept
            };
            setProject(newProject);
            onProjectGenerated?.(newProject);
        } catch (err) {
            alert('翻译创意失败，请重试。');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* 核心创意输入 */}
            <Card className="p-6">
                <h3 className="text-lg font-serif font-bold text-[#8B4513] mb-2 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-[#C41E3A]" />
                    核心创意输入
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    简单描述您的想法，AI 将为您转化为专业设计。
                </p>
                <Textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="例如：设计一款结合了皮影戏元素的蓝牙音箱，外观复古但功能现代..."
                    className="h-24 mb-4 resize-none"
                />
                <Button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37]"
                >
                    {isTranslating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            生成工业设计提案
                        </>
                    )}
                </Button>
            </Card>

            {/* 设计提案详情 */}
            {project && (
                <Card className="flex-1 overflow-hidden border-t-4 border-[#D4AF37]">
                    {/* 头部 */}
                    <div className="p-6 pb-4 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Concept
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-[#C41E3A]">
                            {project.conceptName}
                        </h3>
                        <p className="text-[#8B4513] mt-2 italic text-sm border-l-2 border-[#D4AF37] pl-3">
                            "{project.designPhilosophy}"
                        </p>
                    </div>

                    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                        {/* 文化脉络 */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                                文化脉络 (Heritage)
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed bg-[#F5F5DC] p-3 rounded-lg border border-gray-200">
                                {project.culturalContext}
                            </p>
                        </div>

                        {/* 物理规格 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Scan className="w-4 h-4 text-gray-400" />
                                    造型语言
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {project.formFactor}
                                </p>
                                {project.dimensions && (
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                        尺寸: {project.dimensions}
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <MousePointerClick className="w-4 h-4 text-gray-400" />
                                    交互逻辑
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {project.userInteraction}
                                </p>
                            </div>
                        </div>

                        {/* CMF */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                <Palette className="w-4 h-4 text-gray-400" />
                                材质与色彩 (CMF)
                            </h4>

                            {/* 材质 */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {project.materials?.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col bg-[#F5F5DC] border border-gray-200 rounded px-2 py-1.5"
                                    >
                                        <span className="text-xs font-bold text-[#8B4513]">{m.name}</span>
                                        <span className="text-[10px] text-gray-400">{m.finish}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 色板 */}
                            <div className="flex gap-3">
                                {project.colors?.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: c.hex }}
                                        />
                                        <span className="text-xs text-gray-500">{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 功能特性 */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">功能特性</h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                {project.keyFeatures?.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 底部操作 */}
                    <div className="p-4 bg-[#F5F5DC] border-t border-gray-200">
                        <Button
                            onClick={onGenerateVisuals}
                            disabled={isGeneratingImg}
                            variant="secondary"
                            className="w-full"
                        >
                            {isGeneratingImg ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8B4513] mr-2" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    生成/更新 视觉方案
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
