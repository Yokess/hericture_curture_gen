import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Download,
    Eye,
    Palette,
    Layers,
    Image as ImageIcon,
    RefreshCcw,
    X,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { generateOrEditImage } from '@/services/geminiService';
import { DesignProject } from '@/types/design';

interface DesignPreviewProps {
    project: DesignProject | null;
    isGeneratingImg?: boolean;
    onImagesGenerated?: (blueprintUrl: string, productUrl: string) => void;
}

export function DesignPreview({
    project,
    isGeneratingImg = false,
    onImagesGenerated
}: DesignPreviewProps) {
    const [blueprintImg, setBlueprintImg] = useState<string | null>(null);
    const [productImg, setProductImg] = useState<string | null>(null);
    const [activeEditTarget, setActiveEditTarget] = useState<'blueprint' | 'product' | null>(null);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    // 生成视觉方案
    const handleGenerateVisuals = async () => {
        if (!project) return;

        try {
            // 生成草图
            const materialList = project.materials?.map(m => `${m.name} (${m.finish})`).join(', ');

            const blueprintPrompt = `
        Professional industrial design technical sheet of ${project.conceptName}, 
        traditional Chinese aesthetic style. 
        Components: Orthographic views (front, side, top), detailed annotations with pointer lines, 
        and callouts for materials like ${materialList}. 
        Form Factor details: ${project.formFactor}.
        Art style: Clean black ink line art combined with soft watercolor wash/shading. 
        Background: Aged parchment or rice paper texture with a subtle border. 
        Features: Technical dimension lines (${project.dimensions}), elegant Chinese calligraphy labels, 
        warm lighting effects, high-quality hand-drawn architectural sketch feel.
      `;

            const blueprintUrl = await generateOrEditImage(blueprintPrompt);
            setBlueprintImg(blueprintUrl);

            // 生成效果图
            const productPrompt = `
        High-end commercial product photography of ${project.conceptName} realized as a physical object.
        Materials: ${materialList} - emphasizing realistic textures.
        Style: "New Chinese" Design (Xin Zhong Shi), blending traditional culture with modern industrial aesthetics.
        Lighting & Atmosphere: Moody, atmospheric museum-quality lighting. Soft shadows, highlighting the craftsmanship and material details.
        Composition: Photorealistic, 8k, depth of field, placed on a textured surface.
        Form: ${project.formFactor}.
      `;

            const productUrl = await generateOrEditImage(productPrompt);
            setProductImg(productUrl);

            onImagesGenerated?.(blueprintUrl, productUrl);
        } catch (err: any) {
            console.error(err);
            alert(`生成视觉图失败: ${err.message || '未知错误'}`);
        }
    };

    // AI 修图
    const handleRefine = async () => {
        if (!activeEditTarget || !refinePrompt) return;

        const targetImg = activeEditTarget === 'blueprint' ? blueprintImg : productImg;
        if (!targetImg) return;

        setIsRefining(true);
        try {
            let base64Data = "";
            let mimeType = "image/png";
            if (targetImg.startsWith('data:')) {
                const parts = targetImg.split(',');
                base64Data = parts[1];
                mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
            }

            const newImageUrl = await generateOrEditImage(refinePrompt, base64Data, mimeType);

            if (activeEditTarget === 'blueprint') {
                setBlueprintImg(newImageUrl);
            } else {
                setProductImg(newImageUrl);
            }

            setActiveEditTarget(null);
            setRefinePrompt('');
        } catch (err: any) {
            console.error(err);
            alert(`AI 修图失败: ${err.message}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 触发生成
    if (isGeneratingImg && !blueprintImg && !productImg && project) {
        handleGenerateVisuals();
    }

    if (!project) {
        return (
            <Card className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-12">
                    <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-serif text-xl font-bold text-gray-600 mb-2">
                        等待设计生成
                    </h3>
                    <p className="text-gray-500">
                        在左侧对话框中描述您的设计需求,AI 将为您生成创意方案
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* 设计信息头部 */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-[#8B4513] mb-2">
                            {project.conceptName}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-700">
                                {blueprintImg && productImg ? '已完成' : '生成中'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 设计参数 */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">非遗元素:</span>
                        <span className="ml-2 font-medium text-gray-700">{project.culturalContext.slice(0, 20)}...</span>
                    </div>
                    <div>
                        <span className="text-gray-500">造型:</span>
                        <span className="ml-2 font-medium text-gray-700">{project.formFactor.slice(0, 15)}...</span>
                    </div>
                    <div>
                        <span className="text-gray-500">尺寸:</span>
                        <span className="ml-2 font-medium text-gray-700">{project.dimensions || 'N/A'}</span>
                    </div>
                </div>
            </Card>

            {/* 视觉展示区 */}
            <div className="flex-1 grid grid-cols-1 gap-6">
                {/* 草图卡片 */}
                <Card className="flex flex-col h-[350px] overflow-hidden relative">
                    <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#D4AF37]" /> 草图 (Blueprint)
                        </span>
                        {blueprintImg && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setActiveEditTarget('blueprint'); setRefinePrompt(''); }}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#C41E3A] transition-colors"
                                    title="AI 修图"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                                <button
                                    onClick={() => handleDownload(blueprintImg, 'blueprint.png')}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#8B4513] transition-colors"
                                    title="下载"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-[#F5F5F4] flex items-center justify-center relative overflow-hidden">
                        {blueprintImg ? (
                            <img src={blueprintImg} alt="Blueprint" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <div className="text-gray-400 text-center text-sm">
                                {isGeneratingImg ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A]" />
                                        <span>正在绘制草图...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        暂无草图
                                    </>
                                )}
                            </div>
                        )}

                        {/* AI 修图覆盖层 */}
                        {activeEditTarget === 'blueprint' && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[#8B4513] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#C41E3A]" /> AI 局部调整 (草图)
                                    </h4>
                                    <button onClick={() => setActiveEditTarget(null)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <Textarea
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    placeholder="描述修改需求，例如：'线条更简洁'，'增加尺寸标注'..."
                                    className="h-32 mb-4 resize-none"
                                />
                                <Button onClick={handleRefine} disabled={isRefining} className="w-full">
                                    {isRefining ? '修改中...' : '确认修改'}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 效果图卡片 */}
                <Card className="flex flex-col h-[350px] overflow-hidden relative">
                    <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> 效果图 (Render)
                        </span>
                        {productImg && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setActiveEditTarget('product'); setRefinePrompt(''); }}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#C41E3A] transition-colors"
                                    title="AI 修图"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                                <button
                                    onClick={() => handleDownload(productImg, 'render.png')}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#8B4513] transition-colors"
                                    title="下载"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                        {productImg ? (
                            <img src={productImg} alt="Product Shot" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-500 text-center text-sm">
                                {isGeneratingImg ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
                                        <span className="text-gray-400">正在基于草图渲染...</span>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        暂无效果图
                                    </>
                                )}
                            </div>
                        )}

                        {/* AI 修图覆盖层 */}
                        {activeEditTarget === 'product' && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[#8B4513] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#C41E3A]" /> AI 局部调整 (效果图)
                                    </h4>
                                    <button onClick={() => setActiveEditTarget(null)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <Textarea
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    placeholder="描述修改需求，例如：'背景改为深色'，'增加金属光泽'..."
                                    className="h-32 mb-4 resize-none"
                                />
                                <Button onClick={handleRefine} disabled={isRefining} className="w-full">
                                    {isRefining ? '修改中...' : '确认修改'}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
