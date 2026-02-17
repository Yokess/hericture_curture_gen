import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, FolderOpen, Layers, ArrowRight, Palette, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import { DesignProject } from '@/types/design';

interface DesignSidebarProps {
    isProcessing: boolean;
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    savedDesigns: DesignProject[];
    onLoadDesign: (design: DesignProject) => void;
    step: 'input' | 'concept' | 'blueprint' | 'render';
    idea: string;
    setIdea: (idea: string) => void;
    project: DesignProject | null;
    blueprintImg: string | null;
    onGenerateConcept: () => void;
    onGenerateBlueprint: () => void;
    onGenerateRender: () => void;
    onNewDesign: () => void;
}

export function DesignSidebar({
    isProcessing,
    showHistory,
    setShowHistory,
    savedDesigns,
    onLoadDesign,
    step,
    idea,
    setIdea,
    project,
    blueprintImg,
    onGenerateConcept,
    onGenerateBlueprint,
    onGenerateRender,
    onNewDesign
}: DesignSidebarProps) {
    return (
        <Card className="p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm border-gray-200">
            {/* AI 助手状态头 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full flex items-center justify-center shadow-md">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl font-bold text-[#8B4513]">AI 创意助理</h2>
                        <div className="flex items-center text-xs font-medium text-gray-500 mt-0.5">
                            <span className={`w-2 h-2 rounded-full mr-2 ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
                            {isProcessing ? '正在思考...' : '准备就绪'}
                        </div>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-[#8B4513] hover:bg-[#8B4513]/10"
                >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    {showHistory ? '收起' : '历史'}
                </Button>
            </div>

            {/* 设计历史面板 (可折叠) */}
            {showHistory && savedDesigns.length > 0 && (
                <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">最近设计</h4>
                        <Badge variant="secondary" className="text-[10px] h-5">{savedDesigns.length}</Badge>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {savedDesigns.map((design) => (
                            <div 
                                key={design.id}
                                onClick={() => onLoadDesign(design)}
                                className="group p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-[#D4AF37] hover:shadow-sm transition-all flex items-center gap-3"
                            >
                                <div className="relative flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                    {design.productShotUrl || design.blueprintUrl ? (
                                        <img 
                                            src={design.productShotUrl || design.blueprintUrl} 
                                            alt={design.conceptName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Layers size={14} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-800 truncate group-hover:text-[#8B4513] transition-colors">{design.conceptName}</div>
                                    <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                        {design.designPhilosophy || '无描述'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 主交互区 */}
            <div className="space-y-6">
                
                {/* 1. 对话输入区 (始终可用) */}
                <div className="relative transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-[#8B4513] flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1.5" />
                            {project ? '对话修改 / 迭代' : '1. 核心创意输入'}
                        </label>
                        {project && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                支持连续对话
                            </span>
                        )}
                    </div>
                    
                    <div className="relative group">
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            // 如果有了项目，提示语变为修改建议
                            placeholder={project 
                                ? "对方案不满意？请输入修改意见，例如：'把材质改成陶瓷'，'风格更现代一点'..." 
                                : "描述您的创意，例如：一款融合皮影戏元素的机械键盘..."
                            }
                            className="w-full px-4 py-3 pb-12 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 min-h-[100px] resize-none bg-white shadow-sm transition-all text-sm leading-relaxed"
                            disabled={isProcessing}
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button 
                                onClick={onGenerateConcept}
                                disabled={isProcessing || !idea.trim()}
                                size="sm"
                                className={`
                                    shadow-sm transition-all duration-300 
                                    ${project 
                                        ? 'bg-white text-[#8B4513] border border-[#8B4513]/20 hover:bg-[#8B4513]/5' 
                                        : 'bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white hover:opacity-90'
                                    }
                                `}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center">
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce mr-1"></span>
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce mr-1 delay-75"></span>
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-150"></span>
                                    </span>
                                ) : (
                                    <>
                                        {project ? '发送修改' : '生成提案'} 
                                        {project ? <ArrowRight className="w-3 h-3 ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. 当前方案卡片 (生成后显示) */}
                {project && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`
                            relative overflow-hidden rounded-xl border transition-all duration-300
                            ${step === 'concept' ? 'bg-[#F5F5DC] border-[#D4AF37] ring-1 ring-[#D4AF37]/30' : 'bg-gray-50 border-gray-200 opacity-90 hover:opacity-100'}
                        `}>
                            {/* 装饰背景 */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="p-4 relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-[10px] text-[#8B4513]/60 uppercase font-bold tracking-wider mb-0.5">Current Concept</div>
                                        <h3 className="font-bold text-lg text-[#8B4513] leading-tight">{project.conceptName}</h3>
                                    </div>
                                    <Badge variant="outline" className="bg-white/50 border-[#8B4513]/30 text-[#8B4513] text-[10px]">
                                        {step === 'concept' ? '待确认' : '已确认'}
                                    </Badge>
                                </div>
                                
                                <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed bg-white/60 p-2 rounded-lg border border-black/5">
                                    {project.designPhilosophy}
                                </p>
                                
                                {step === 'concept' && (
                                    <Button 
                                        onClick={onGenerateBlueprint}
                                        disabled={isProcessing}
                                        className="w-full bg-[#8B4513] hover:bg-[#723b10] text-white shadow-sm h-9 text-xs"
                                    >
                                        确认方案并生成草图 <Layers className="w-3 h-3 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. 草图阶段卡片 */}
                {(step === 'blueprint' || step === 'render') && blueprintImg && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`
                            relative overflow-hidden rounded-xl border transition-all duration-300
                            ${step === 'blueprint' ? 'bg-[#F5F5DC] border-[#D4AF37] ring-1 ring-[#D4AF37]/30' : 'bg-gray-50 border-gray-200'}
                        `}>
                            <div className="p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 p-1 shadow-sm flex-shrink-0">
                                    <img src={blueprintImg} alt="Blueprint" className="w-full h-full object-cover rounded" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-[#8B4513] mb-1">工程草图 (Blueprint)</h4>
                                    
                                    {step === 'blueprint' ? (
                                        <Button 
                                            onClick={onGenerateRender}
                                            disabled={isProcessing}
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white h-8 text-xs shadow-sm hover:shadow"
                                        >
                                            渲染效果图 <Palette className="w-3 h-3 ml-2" />
                                        </Button>
                                    ) : (
                                        <div className="flex items-center text-xs text-green-600">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> 已完成
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. 完成状态 */}
                {step === 'render' && (
                    <div className="bg-green-50/80 rounded-xl p-4 border border-green-200/60 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-green-800 font-bold text-sm">设计方案已定稿</p>
                        <p className="text-green-600/80 text-xs mb-3">您可以继续对话微调，或开始新设计</p>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={onNewDesign}
                            className="text-green-700 border-green-200 hover:bg-green-100 h-8 text-xs bg-white"
                        >
                            开始新设计
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}