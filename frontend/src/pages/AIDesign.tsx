import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { designApi } from '@/api/design'; // 统一使用 designApi
import { authApi } from '@/api/auth';
import { DesignProject } from '@/types/design';

// 引入拆分的子组件
import { DesignSidebar } from '@/components/ai-design/DesignSidebar';
import { DesignPreviewCard } from '@/components/ai-design/DesignPreviewCard';
import { DesignInfoCard } from '@/components/ai-design/DesignInfoCard';

export default function AIDesign() {
    // --- 状态定义 ---
    const [idea, setIdea] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [project, setProject] = useState<DesignProject | null>(null);
    const [savedDesigns, setSavedDesigns] = useState<DesignProject[]>([]);
    const [showHistory, setShowHistory] = useState(true);
    const [currentDesignId, setCurrentDesignId] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    
    // 关键：对话历史
    const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
    
    // 流程与视觉状态
    const [step, setStep] = useState<'input' | 'concept' | 'blueprint' | 'render'>('input');
    const [blueprintImg, setBlueprintImg] = useState<string | null>(null);
    const [productImg, setProductImg] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<number>(0);
    const [images, setImages] = useState<{ blueprint?: string | null; render?: string | null; kv?: string | null; lifestyle?: string | null; detail?: string | null }>({});

    // --- 初始化 ---
    useEffect(() => {
        const fetchUser = async () => {
            const user = authApi.getLocalUser();
            if (user) {
                setUserId(user.id);
                loadUserDesigns();
            }
        };
        fetchUser();
    }, []);

    const loadUserDesigns = async () => {
        try {
            const res = await designApi.getMyDesigns();
            setSavedDesigns(res.data || []);
        } catch (err) {
            console.error('加载设计历史失败:', err);
        }
    };

    // --- 核心业务逻辑 ---

    /**
     * 1. 生成/修改设计概念 (修复了对话上下文问题)
     */
const handleGenerateConcept = async () => {
        if (!idea.trim()) return;
        setIsProcessing(true);
        try {
            // 【优化逻辑】：
            // 如果 chatHistory 为空，说明是第一次生成，需要查阅资料 (useRag: true)
            // 如果 chatHistory 有内容，说明是后续修改，主要依赖上下文，不需要再查资料 (useRag: false)
            // 这样既能提高响应速度，又能避免由简单指令(如"变红")检索出的无关噪音
            const isFirstTurn = chatHistory.length === 0;

            const res = await designApi.generateConcept({
                idea: idea,
                useRag: isFirstTurn, // <--- 动态控制：仅首轮开启 RAG
                chatHistory: chatHistory 
            });
            
            const newProject = res.data; 

            setProject(newProject);
            setStep('concept');
            
            const assistantContent = JSON.stringify(newProject);

            const newHistory = [
                ...chatHistory,
                { role: 'user', content: idea },
                { role: 'assistant', content: assistantContent }
            ];
            setChatHistory(newHistory);
            
            // 建议：修改后清空输入框，提升体验
            setIdea(''); 
            
        } catch (err) {
            console.error(err);
            alert('生成概念失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * 2. 生成草图
     */
    const handleGenerateBlueprint = async () => {
        if (!project) return;
        setIsProcessing(true);
        try {
            const res = await designApi.generateBlueprint({ concept: project });
            // 假设后端直接返回 url 字符串，或者包装在 data 对象中
            const url = typeof res.data === 'string' ? res.data : (res.data as any).data;
            
            setBlueprintImg(url);
            setImages((prev) => ({ ...prev, blueprint: url }));
            setStep('blueprint');
            setSelectedView(0); // 自动切换到草图视图
        } catch (err) {
            console.error(err);
            alert('生成草图失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * 3. 生成效果图
     */
    const handleGenerateRender = async () => {
        if (!project || !blueprintImg) return;
        setIsProcessing(true);
        try {
            const res = await designApi.generateRender({ 
                concept: project, 
                blueprintUrl: blueprintImg 
            });
            const url = typeof res.data === 'string' ? res.data : (res.data as any).data;

            setProductImg(url);
            setImages((prev) => ({ ...prev, render: url }));
            setStep('render');
            setSelectedView(1); // 自动切换到效果图视图
        } catch (err) {
            console.error(err);
            alert('生成效果图失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 其他操作逻辑 ---

    const handleNewDesign = () => {
        setStep('input');
        setIdea('');
        setProject(null);
        setBlueprintImg(null);
        setProductImg(null);
        setImages({});
        setCurrentDesignId(null);
        setIsSaved(false);
        setChatHistory([]); // 清空历史，开始新会话
    };

    const handleLoadDesign = (savedProject: DesignProject) => {
        setProject(savedProject);
        // 如果是加载旧设计，最好重置 idea 为设计理念，方便用户查看
        setIdea(savedProject.designPhilosophy || '');
        setBlueprintImg(savedProject.blueprintUrl || null);
        setProductImg(savedProject.productShotUrl || null);
        setImages({
            blueprint: savedProject.blueprintUrl || null,
            render: savedProject.productShotUrl || null,
            kv: savedProject.kvUrl || null,
            lifestyle: savedProject.lifestyleUrl || null,
            detail: savedProject.detailUrl || null,
        });
        
        if (savedProject.id) {
            setCurrentDesignId(parseInt(savedProject.id));
        }

        // 恢复流程状态
        if (savedProject.productShotUrl) {
            setStep('render');
            setSelectedView(1);
        } else if (savedProject.blueprintUrl) {
            setStep('blueprint');
            setSelectedView(0);
        } else {
            setStep('concept');
        }

        setShowHistory(false);
        setIsSaved(true);
        // 注意：加载历史设计时，chatHistory 暂时为空，如果需要基于旧设计继续对话，
        // 需要后端返回该设计的历史记录并在前端 setChatHistory
    };

    const handleSaveDesign = async () => {
        if (!project || !userId) return;
        try {
            const projectToSave = {
                ...project,
                id: currentDesignId ? currentDesignId.toString() : undefined,
                blueprintUrl: blueprintImg || undefined,
                productShotUrl: productImg || undefined,
                kvUrl: images.kv || undefined,
                lifestyleUrl: images.lifestyle || undefined,
                detailUrl: images.detail || undefined
            };
            
            // 使用 designApi.saveDesign
            const res = await designApi.saveDesign({
                userId: userId,
                project: projectToSave,
                userIdea: chatHistory.length > 0 ? chatHistory[0].content : idea,
                chatHistory: chatHistory // 保存对话历史到数据库
            });

            // 获取保存后的 ID
            // 根据你的 API 返回结构调整，这里假设是 res.data.data.id
            const savedData = res.data as any;
            const newId = savedData.data?.id || savedData.id;
            
            if (newId) {
                setCurrentDesignId(newId);
            }
            
            setIsSaved(true);
            alert('设计已保存到您的作品库');
            loadUserDesigns();
        } catch (err) {
            console.error(err);
            alert('保存失败，请重试');
        }
    };

    const handleGenerateAnalysis = async () => {
        if (!project) {
            alert('请先生成设计方案');
            return;
        }
        if (!currentDesignId) {
            await handleSaveDesign();
        }
        if (!userId) return;

        setIsProcessing(true);
        try {
            // 重新获取 ID 确保准确
            const res = await designApi.getMyDesigns();
            const designs = res.data || [];
            // 简单逻辑：找最新的同名项目
            const latest = designs.find((d: DesignProject) => d.conceptName === project.conceptName);
            
            let designId = currentDesignId;
            if (latest && latest.id) {
                designId = parseInt(latest.id);
            }

            if (!designId) {
                alert('无法获取项目ID，无法生成报告');
                return;
            }
            
            alert('正在生成市场分析、技术可行性和风险评估报告，请稍候...');
            const analysisRes = await designApi.generateAnalysis({ concept: project });
            const analysis = analysisRes.data;
            
            if (analysis) {
                await designApi.saveAnalysis(designId, analysis);
                alert('分析报告已生成并保存！\n\n请再次点击"导出方案"下载包含完整专业报告的PDF。');
                loadUserDesigns();
            }
        } catch (err) {
            console.error('生成分析失败:', err);
            alert('生成分析报告失败，请重试');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportPdf = async () => {
        let designId = currentDesignId;
        
        // 如果还没保存，尝试先保存
        if (!designId && project) {
            alert('请先保存设计');
            return;
        }

        try {
            const blob = await designApi.exportPdf(designId!);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project?.conceptName || '设计提案'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('导出PDF失败:', err);
            alert('导出PDF失败，请重试');
        }
    };

    const handlePublishDesign = async () => {
        if (!currentDesignId) {
            alert('请先保存设计');
            return;
        }
        try {
            await designApi.publishDesign(currentDesignId);
            alert('设计已发布到社区!');
        } catch (err) {
            alert('发布失败，请重试');
        }
    };

    const handleGenerateKv = async () => {
        if (!project) {
            alert('请先生成设计方案');
            return;
        }
        if (!currentDesignId) {
            await handleSaveDesign();
        }
        if (!currentDesignId) {
            alert('请先保存设计');
            return;
        }
        setIsProcessing(true);
        try {
            const res = await designApi.generateKv(currentDesignId);
            const kv = res.data;
            setImages((prev) => ({
                ...prev,
                kv: kv.kvUrl,
                lifestyle: kv.lifestyleUrl,
                detail: kv.detailUrl,
            }));
            setSelectedView(2);
            await loadUserDesigns();
        } catch (err) {
            console.error(err);
            alert('生成KV失败，请重试');
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
                            <DesignSidebar 
                                isProcessing={isProcessing}
                                showHistory={showHistory}
                                setShowHistory={setShowHistory}
                                savedDesigns={savedDesigns}
                                onLoadDesign={handleLoadDesign}
                                step={step}
                                idea={idea}
                                setIdea={setIdea}
                                project={project}
                                blueprintImg={blueprintImg}
                                onGenerateConcept={handleGenerateConcept}
                                onGenerateBlueprint={handleGenerateBlueprint}
                                onGenerateRender={handleGenerateRender}
                                onNewDesign={handleNewDesign}
                            />
                        </div>

                        {/* 右侧: 视觉展示与详情区 */}
                        <div className="lg:col-span-2 space-y-8">
                            <DesignPreviewCard 
                                images={images}
                                blueprintImg={blueprintImg}
                                productImg={productImg}
                                selectedView={selectedView}
                                setSelectedView={setSelectedView}
                                isProcessing={isProcessing}
                                step={step}
                                isSaved={isSaved}
                                onSave={handleSaveDesign}
                                onAnalyze={handleGenerateAnalysis}
                                onGenerateKv={handleGenerateKv}
                                onExport={handleExportPdf}
                                onPublish={handlePublishDesign}
                            />

                            <DesignInfoCard project={project} />
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
}
