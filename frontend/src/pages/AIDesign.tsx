import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Wand2,
    Palette,
    Scan,
    Bot,
    Send,
    Download,
    RefreshCcw,
    Layers,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    Ruler,
    Hammer,
    Sparkles,
    MousePointerClick,
    FolderOpen,
    Save,
    Upload
} from 'lucide-react';
import { generateConceptOnly, generateBlueprint, generateRender } from '@/services/geminiService';
import { designApi } from '@/api/design';
import { DesignProject } from '@/types/design';

const MOCK_USER_ID = 1;

export default function AIDesign() {
    const [idea, setIdea] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [project, setProject] = useState<DesignProject | null>(null);
    const [savedDesigns, setSavedDesigns] = useState<DesignProject[]>([]);
    const [showHistory, setShowHistory] = useState(true);
    const [currentDesignId, setCurrentDesignId] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    // 流程状态: 'input' | 'concept' | 'blueprint' | 'render'
    const [step, setStep] = useState<'input' | 'concept' | 'blueprint' | 'render'>('input');
    
    const [blueprintImg, setBlueprintImg] = useState<string | null>(null);
    const [productImg, setProductImg] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<number>(0);

    // 加载用户设计历史
    useEffect(() => {
        loadUserDesigns();
    }, []);

    const loadUserDesigns = async () => {
        try {
            const res = await designApi.getUserDesigns(MOCK_USER_ID);
            console.log('API响应:', res);
            const designs = res.data || [];
            console.log('设计列表:', designs);
            setSavedDesigns(designs);
        } catch (err) {
            console.error('加载设计历史失败:', err);
        }
    };

    const handleSaveDesign = async () => {
        if (!project) return;
        try {
            const projectToSave = {
                ...project,
                blueprintUrl: blueprintImg || undefined,
                productShotUrl: productImg || undefined
            };
            await designApi.saveDesign({
                userId: MOCK_USER_ID,
                project: projectToSave,
                userIdea: idea
            });
            setIsSaved(true);
            alert('设计已保存到您的作品库');
            loadUserDesigns();
        } catch (err) {
            alert('保存失败，请重试');
        }
    };

    const handleLoadDesign = (savedProject: DesignProject) => {
        setProject(savedProject);
        setIdea(savedProject.designPhilosophy || '');
        setBlueprintImg(savedProject.blueprintUrl || null);
        setProductImg(savedProject.productShotUrl || null);
        setCurrentDesignId(parseInt(savedProject.id));
        setStep(savedProject.productShotUrl ? 'render' : savedProject.blueprintUrl ? 'blueprint' : 'concept');
        setShowHistory(false);
        setIsSaved(true);
    };

    const handlePublishDesign = async () => {
        if (!project || !currentDesignId) {
            // 先保存再发布
            if (!isSaved) {
                await handleSaveDesign();
            }
        }
        
        if (currentDesignId) {
            try {
                await designApi.publishDesign(currentDesignId, MOCK_USER_ID);
                alert('设计已发布到社区!');
            } catch (err) {
                alert('发布失败，请重试');
            }
        }
    };

    const handleNewDesign = () => {
        setStep('input');
        setIdea('');
        setProject(null);
        setBlueprintImg(null);
        setProductImg(null);
        setCurrentDesignId(null);
        setIsSaved(false);
    };

    // 第一步：生成概念
    const handleGenerateConcept = async () => {
        if (!idea.trim()) return;
        setIsProcessing(true);
        try {
            const concept = await generateConceptOnly(idea);
            // concept 中已经包含了后端生成的 id (UUID)，无需再手动生成
            setProject(concept);
            setStep('concept');
        } catch (err) {
            alert('生成概念失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    // 第二步：生成草图
    const handleGenerateBlueprint = async () => {
        if (!project) return;
        setIsProcessing(true);
        try {
            const url = await generateBlueprint(project);
            setBlueprintImg(url);
            setStep('blueprint');
            setSelectedView(0); // 自动切换到草图视图
        } catch (err) {
            alert('生成草图失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    // 第三步：生成效果图 (图生图)
    const handleGenerateRender = async () => {
        if (!project || !blueprintImg) return;
        setIsProcessing(true);
        try {
            // 传入 blueprintUrl 作为参考图
            const url = await generateRender(project, blueprintImg);
            setProductImg(url);
            setStep('render');
            setSelectedView(1); // 自动切换到效果图视图
        } catch (err) {
            alert('生成效果图失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
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
                        分步协同创作：概念 → 草图 → 渲染
                    </p>
                </div>
            </section>

            {/* 主工作区 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* 左侧: 对话引导区 */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                                {/* AI 助手状态 */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#C41E3A] to-[#D4AF37] rounded-full flex items-center justify-center">
                                            <Bot className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-serif text-xl font-bold text-[#8B4513]">AI 总设计师</h2>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className={`w-2 h-2 rounded-full mr-2 ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                                                {isProcessing ? '思考中...' : '在线'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="text-[#8B4513]"
                                    >
                                        <FolderOpen className="w-4 h-4 mr-1" />
                                        {showHistory ? '关闭' : '历史'}
                                    </Button>
                                </div>

                                {/* 设计历史面板 */}
                                {showHistory && savedDesigns.length > 0 && (
                                    <div className="mb-4 p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-amber-800">我的设计</h4>
                                            <Badge variant="outline" className="text-xs">{savedDesigns.length}个</Badge>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {savedDesigns.map((design) => (
                                                <div 
                                                    key={design.id}
                                                    onClick={() => handleLoadDesign(design)}
                                                    className="p-2 bg-white rounded-lg border border-amber-100 cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all flex items-center gap-3"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        {design.productShotUrl || design.blueprintUrl ? (
                                                            <img 
                                                                src={design.productShotUrl || design.blueprintUrl} 
                                                                alt={design.conceptName}
                                                                className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZTZlNmU2Ij48cGF0aCBkPSJNMTIgMkwyIDIyaDIwbC0xMC0yMHptMCAyNGwyIDJoMjBsLTEtMjB6Ii8+PC9zdmc+';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                                <Layers className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        {design.productShotUrl && (
                                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] px-1 rounded">已完成</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-amber-900 truncate">{design.conceptName}</div>
                                                        <div className="text-xs text-amber-700/70 truncate mt-0.5">
                                                            {design.designPhilosophy?.substring(0, 25) || '暂无描述'}...
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 输入/展示区 */}
                                <div className="space-y-6">
                                    {/* 步骤 1: 创意输入 */}
                                    <div className={`transition-all duration-300 ${step !== 'input' ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">1. 核心创意</label>
                                        <div className="relative">
                                            <textarea
                                                value={idea}
                                                onChange={(e) => setIdea(e.target.value)}
                                                placeholder="描述您的创意，例如：一款融合皮影戏元素的机械键盘..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] min-h-[100px]"
                                                disabled={step !== 'input'}
                                            />
                                            {step === 'input' && (
                                                <Button 
                                                    onClick={handleGenerateConcept}
                                                    disabled={isProcessing || !idea.trim()}
                                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] btn-sm"
                                                >
                                                    生成概念 <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 步骤 2: 概念确认 & 生成草图 */}
                                    {step !== 'input' && project && (
                                        <div className={`bg-[#F5F5DC] rounded-xl p-4 border border-[#D4AF37]/30 transition-all duration-300 ${step !== 'concept' ? 'opacity-80' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-[#8B4513]">{project.conceptName}</h3>
                                                <Badge variant="outline" className="text-[#8B4513] border-[#8B4513]">已生成</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{project.designPhilosophy}</p>
                                            
                                            {step === 'concept' && (
                                                <Button 
                                                    onClick={handleGenerateBlueprint}
                                                    disabled={isProcessing}
                                                    className="w-full bg-white border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                                                >
                                                    确认概念并生成草图 <Layers className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* 步骤 3: 草图确认 & 生成效果图 */}
                                    {(step === 'blueprint' || step === 'render') && blueprintImg && (
                                        <div className={`bg-[#F5F5DC] rounded-xl p-4 border border-[#D4AF37]/30 transition-all duration-300 ${step !== 'blueprint' ? 'opacity-80' : ''}`}>
                                            <div className="flex items-center mb-4">
                                                <img src={blueprintImg} alt="草图缩略" className="w-16 h-16 object-cover rounded-lg border border-gray-300 mr-3" />
                                                <div>
                                                    <h3 className="font-bold text-[#8B4513]">设计草图</h3>
                                                    <p className="text-xs text-gray-500">已包含结构与尺寸标注</p>
                                                </div>
                                            </div>
                                            
                                            {step === 'blueprint' && (
                                                <Button 
                                                    onClick={handleGenerateRender}
                                                    disabled={isProcessing}
                                                    className="w-full bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white"
                                                >
                                                    基于草图渲染效果图 <Palette className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* 完成状态 */}
                                    {step === 'render' && (
                                        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                                            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-green-800 font-medium">设计方案已完成</p>
                                            <Button 
                                                variant="link" 
                                                onClick={handleNewDesign}
                                                className="text-green-700 underline mt-1"
                                            >
                                                开始新设计
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* 右侧: 视觉展示区 */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* 上半部分：视觉预览 */}
                            <Card className="p-8">
                                {/* 顶部缩略图栏 */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {/* 草图位 */}
                                    <div 
                                        onClick={() => blueprintImg && setSelectedView(0)}
                                        className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                                            selectedView === 0 ? 'border-[#8B4513] bg-[#F5F5DC]' : 'border-dashed border-gray-300'
                                        }`}
                                    >
                                        {blueprintImg ? (
                                            <img src={blueprintImg} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Layers className="w-8 h-8 mx-auto mb-1" />
                                                <span className="text-xs">等待生成草图</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 效果图位 */}
                                    <div 
                                        onClick={() => productImg && setSelectedView(1)}
                                        className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                                            selectedView === 1 ? 'border-[#8B4513] bg-[#F5F5DC]' : 'border-dashed border-gray-300'
                                        }`}
                                    >
                                        {productImg ? (
                                            <img src={productImg} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Palette className="w-8 h-8 mx-auto mb-1" />
                                                <span className="text-xs">等待渲染效果</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 细节位 (占位) */}
                                    <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 opacity-50">
                                        <div className="text-center text-gray-300">
                                            <Scan className="w-8 h-8 mx-auto mb-1" />
                                            <span className="text-xs">细节视图</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 主预览区 */}
                                <div className="bg-gray-100 rounded-2xl overflow-hidden relative min-h-[400px] flex items-center justify-center">
                                    {((selectedView === 0 && blueprintImg) || (selectedView === 1 && productImg)) ? (
                                        <img 
                                            src={selectedView === 0 ? blueprintImg! : productImg!} 
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            {isProcessing ? (
                                                <div className="space-y-4">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" />
                                                    <p className="text-[#8B4513] animate-pulse">
                                                        {step === 'input' ? '正在构思概念...' : 
                                                         step === 'concept' ? '正在绘制工程草图...' : 
                                                         '正在渲染最终效果图 (图生图)...'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                                    <p>请在左侧开始设计流程</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* 底部操作栏 */}
                                {productImg && (
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <Button variant="outline" onClick={handleSaveDesign}>
                                            <Save className="w-4 h-4 mr-2" /> 
                                            {isSaved ? '已保存' : '保存设计'}
                                        </Button>
                                        <Button variant="outline">
                                            <Download className="w-4 h-4 mr-2" /> 导出方案
                                        </Button>
                                        <Button className="bg-[#8B4513]" onClick={handlePublishDesign}>
                                            <Upload className="w-4 h-4 mr-2" /> 发布设计
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            {/* 下半部分：详细设计方案 */}
                            {project && (
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
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
}
