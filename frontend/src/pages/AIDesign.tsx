import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
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
    Camera,
    Bot,
    Send,
    Download,
    RefreshCcw,
    Share2
} from 'lucide-react';
import { translateToDesignConcept, generateOrEditImage } from '@/services/geminiService';
import { DesignProject } from '@/types/design';

export default function AIDesign() {
    const [idea, setIdea] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [project, setProject] = useState<DesignProject | null>(null);
    const [isGeneratingImg, setIsGeneratingImg] = useState(false);
    const [blueprintImg, setBlueprintImg] = useState<string | null>(null);
    const [productImg, setProductImg] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<number>(0);

    // 创意翻译
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
        } catch (err) {
            alert('翻译创意失败，请重试。');
        } finally {
            setIsTranslating(false);
        }
    };

    // 生成视觉方案
    const handleGenerateVisuals = async () => {
        if (!project) return;
        setIsGeneratingImg(true);
        setBlueprintImg(null);
        setProductImg(null);

        try {
            const materialList = project.materials?.map(m => `${m.name} (${m.finish})`).join(', ');

            const blueprintPrompt = `Professional industrial design technical sheet of ${project.conceptName}`;
            const blueprintUrl = await generateOrEditImage(blueprintPrompt);
            setBlueprintImg(blueprintUrl);

            const productPrompt = `High-end product photography of ${project.conceptName}`;
            const productUrl = await generateOrEditImage(productPrompt);
            setProductImg(productUrl);
        } catch (err: any) {
            alert(`生成失败: ${err.message}`);
        } finally {
            setIsGeneratingImg(false);
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

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 页面标题 */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">
                        AI 文创设计工作站
                    </h1>
                    <p className="text-xl text-gray-600">
                        让 AI 总设计师帮您创作非遗文创产品
                    </p>
                </div>
            </section>

            {/* 主工作区 - 1:2 布局 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* 左侧: 对话引导区 (1/3) */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-24">
                                {/* AI 头像 */}
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#C41E3A] to-[#D4AF37] rounded-full flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-[#8B4513]">AI 总设计师</h2>
                                        <p className="text-sm text-gray-500">在线</p>
                                    </div>
                                </div>

                                {/* 对话历史 */}
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    <div className="bg-[#F5F5DC] rounded-lg p-4">
                                        <p className="text-gray-700 mb-2">您好!我是 AI 总设计师,我将帮助您创作非遗文创产品。请告诉我:</p>
                                        <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                                            <li>• 您想基于哪个非遗项目?</li>
                                            <li>• 设计什么类型的产品?</li>
                                            <li>• 期望的风格是什么?</li>
                                        </ul>
                                    </div>

                                    {project && (
                                        <>
                                            <div className="bg-blue-50 rounded-lg p-4 ml-8">
                                                <p className="text-gray-700">{idea}</p>
                                            </div>
                                            <div className="bg-[#F5F5DC] rounded-lg p-4">
                                                <p className="text-gray-700">很好!让我为您生成专业的设计方案...</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 输入框 */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                        placeholder="输入您的想法..."
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <button
                                        onClick={handleTranslate}
                                        disabled={isTranslating}
                                        className="absolute right-2 top-2 p-2 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* 生成按钮 */}
                                <Button
                                    onClick={handleGenerateVisuals}
                                    disabled={!project || isGeneratingImg}
                                    className="w-full bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] hover:shadow-lg"
                                >
                                    {isGeneratingImg ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            生成中...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            生成设计方案
                                        </>
                                    )}
                                </Button>
                            </Card>
                        </div>

                        {/* 右侧: 设计方案展示 (2/3) */}
                        <div className="lg:col-span-2">
                            <Card className="p-8">
                                {/* 头部操作栏 */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-[#8B4513]">设计方案</h2>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleGenerateVisuals()}>
                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                            重新生成
                                        </Button>
                                        <Button size="sm" className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37]">
                                            <Download className="w-4 h-4 mr-2" />
                                            导出 PDF
                                        </Button>
                                    </div>
                                </div>

                                {project ? (
                                    <>
                                        {/* 缩略图选择 */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            {[0, 1, 2].map((index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedView(index)}
                                                    className={`aspect-square bg-gradient-to-br from-[#F5F5DC] to-[#D4AF37]/20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedView === index ? 'border-2 border-[#D4AF37]' : 'hover:border-2 hover:border-[#D4AF37]'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-2">
                                                            <Palette className="w-8 h-8 text-[#8B4513]" />
                                                        </div>
                                                        <p className="text-sm text-[#8B4513]">设计草图 {index + 1}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 主图展示 */}
                                        <div className="aspect-video bg-gradient-to-br from-[#F5F5DC] to-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-8">
                                            {blueprintImg || productImg ? (
                                                <img
                                                    src={selectedView === 0 ? blueprintImg || '' : productImg || ''}
                                                    alt="设计图"
                                                    className="w-full h-full object-contain rounded-2xl"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Palette className="w-12 h-12 text-[#8B4513]" />
                                                    </div>
                                                    <p className="font-serif text-xl text-[#8B4513]">
                                                        {isGeneratingImg ? '正在生成设计图...' : `${project.conceptName} - 主视图`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 设计说明 */}
                                        <div className="mb-6">
                                            <h3 className="font-serif text-xl font-bold text-[#8B4513] mb-3">设计说明</h3>
                                            <div className="bg-[#F5F5DC] rounded-xl p-6">
                                                <h4 className="font-semibold text-[#8B4513] mb-2">{project.conceptName}</h4>
                                                <p className="text-gray-700 leading-relaxed mb-4">
                                                    {project.culturalContext}
                                                </p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="font-semibold text-[#8B4513] mb-1">设计哲学</p>
                                                        <p className="text-gray-600">{project.designPhilosophy}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#8B4513] mb-1">建议材质</p>
                                                        <p className="text-gray-600">
                                                            {project.materials?.map(m => m.name).join(', ')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#8B4513] mb-1">尺寸规格</p>
                                                        <p className="text-gray-600">{project.dimensions || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#8B4513] mb-1">生成时间</p>
                                                        <p className="text-gray-600">5.4 秒</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 操作按钮 */}
                                        <div className="flex items-center justify-between">
                                            <Button variant="outline" className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white">
                                                保存草稿
                                            </Button>
                                            <Button className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37]">
                                                发布到社区
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="aspect-video bg-gradient-to-br from-[#F5F5DC] to-[#D4AF37]/20 rounded-2xl flex items-center justify-center">
                                        <div className="text-center">
                                            <Palette className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                            <h3 className="font-serif text-xl font-bold text-gray-600 mb-2">
                                                等待设计生成
                                            </h3>
                                            <p className="text-gray-500">
                                                在左侧对话框中描述您的设计需求,AI 将为您生成创意方案
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
