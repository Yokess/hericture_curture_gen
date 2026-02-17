import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    PencilRuler,    // 替代 Layers，更像草图
    Box,            // 实物
    Sparkles,       // KV
    Armchair,       // 场景 (替代 Coffee，更像家居/生活)
    ScanLine,       // 细节
    Image as ImageIcon,
    Download, 
    Maximize2, 
    Minimize2,
    RefreshCw, 
    Save, 
    Upload, 
    ZoomIn,
    ZoomOut,
    Grid3X3,
    Info,
    Settings2,
    X,
    CheckCircle2,
    Loader2,
    Copy,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- 类型定义 ---

export interface DesignImages {
    blueprint?: string | null;  // 1:1 概念草图
    render?: string | null;     // 1:1 实物定妆
    kv?: string | null;         // 9:16 商业KV
    lifestyle?: string | null;  // 9:16 场景应用
    detail?: string | null;     // 9:16 工艺细节
}

interface DesignPreviewCardProps {
    /** 核心视觉数据源 */
    images?: DesignImages;
    
    // 兼容旧属性
    blueprintImg?: string | null;
    productImg?: string | null;
    
    selectedView: number;
    setSelectedView: (view: number) => void;
    
    isProcessing: boolean;
    step: string;
    
    // 状态与回调
    isSaved: boolean;
    onSave: () => void;
    onAnalyze: () => void;
    onExport: () => void;
    onPublish: () => void;
}

type ViewType = 'blueprint' | 'render' | 'kv' | 'lifestyle' | 'detail';

interface ViewConfig {
    id: ViewType;
    label: string;
    subLabel: string;
    icon: React.ElementType;
    description: string;
    emptyIcon: React.ElementType;
    ratio: 'square' | 'vertical'; 
    resolution: string;
}

// --- 配置常量 (优化文案与图标) ---

const VIEW_CONFIGS: ViewConfig[] = [
    {
        id: 'blueprint',
        label: '概念草图',
        subLabel: 'Concept Sketch',
        icon: PencilRuler,
        description: '设计初期的工程线稿、结构拆解与尺寸标注。',
        emptyIcon: PencilRuler,
        ratio: 'square',
        resolution: '1024 x 1024'
    },
    {
        id: 'render',
        label: '实物定妆',
        subLabel: 'Product Render',
        icon: Box,
        description: '基于物理渲染(PBR)材质的高保真白底产品图。',
        emptyIcon: Box,
        ratio: 'square',
        resolution: '1024 x 1024'
    },
    {
        id: 'kv',
        label: '商业 KV',
        subLabel: 'Key Visual',
        icon: Sparkles,
        description: '包含品牌视觉识别(VI)系统与营销文案的竖版海报。',
        emptyIcon: Sparkles,
        ratio: 'vertical',
        resolution: '1080 x 1920'
    },
    {
        id: 'lifestyle',
        label: '场景应用',
        subLabel: 'Lifestyle',
        icon: Armchair,
        description: '展示产品在真实生活环境中的使用状态与氛围感。',
        emptyIcon: ImageIcon,
        ratio: 'vertical',
        resolution: '1080 x 1920'
    },
    {
        id: 'detail',
        label: '工艺细节',
        subLabel: 'Craft Detail',
        icon: ScanLine,
        description: '针对材质纹理、接缝工艺与表面处理的微距特写。',
        emptyIcon: ScanLine,
        ratio: 'vertical',
        resolution: '1080 x 1920'
    }
];

// --- 子组件：自适应缩放画布 ---

interface ZoomableCanvasProps {
    src: string;
    alt: string;
    showGrid: boolean;
    zoom: number;
    ratio: 'square' | 'vertical';
}

const ZoomableCanvas: React.FC<ZoomableCanvasProps> = ({ src, alt, showGrid, zoom, ratio }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // 计算容器的宽高比样式，用于阴影和边框
    // 注意：这里不再用 vh，而是用百分比，让它自适应父容器高度
    const aspectRatioStyle = ratio === 'vertical' ? { aspectRatio: '9/16' } : { aspectRatio: '1/1' };

    return (
        <div className="w-full h-full overflow-hidden relative bg-[#F9F9F9] flex items-center justify-center cursor-move active:cursor-grabbing group p-8">
            {/* 背景网格 */}
            <div 
                className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-300 z-0",
                    showGrid ? "opacity-100" : "opacity-0"
                )}
                style={{ 
                    backgroundImage: `
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }} 
            />
            
            {/* Loading */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                </div>
            )}

            {/* 图片容器：核心修改点 */}
            {/* 使用 h-full 让图片高度跟随父容器，w-auto 保持比例，max-w-full 防止溢出 */}
            <div 
                className="relative z-10 transition-transform duration-200 ease-out origin-center shadow-2xl shadow-black/10 bg-white ring-1 ring-black/5"
                style={{ 
                    transform: `scale(${zoom})`,
                    height: '100%', 
                    ...aspectRatioStyle 
                }}
            >
                <img 
                    src={src} 
                    alt={alt}
                    onLoad={() => setIsLoaded(true)}
                    className="w-full h-full object-cover select-none pointer-events-none" 
                    draggable={false}
                />
            </div>
        </div>
    );
};

// --- 生成日志组件 ---
const GenerationLog: React.FC = () => (
    <div className="font-mono text-[10px] text-gray-400 space-y-1 w-full max-w-xs text-left p-2 opacity-70">
        <div className="flex items-center"><span className="text-[#8B4513] mr-2">System:</span>Initializing SDXL pipeline...</div>
        <div className="flex items-center"><span className="text-[#8B4513] mr-2">System:</span>Loading LoRA weights...</div>
        <div className="flex items-center"><span className="text-[#8B4513] mr-2">Render:</span>Denoising steps 20/30...</div>
        <div className="animate-pulse text-[#8B4513]">_</div>
    </div>
);

// --- 主组件 ---

export function DesignPreviewCard({
    images,
    blueprintImg,
    productImg,
    selectedView,
    setSelectedView,
    isProcessing,
    step,
    isSaved,
    onSave,
    onAnalyze,
    onExport,
    onPublish
}: DesignPreviewCardProps) {
    // 状态
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(true);

    // 数据映射
    const viewDataMap: Record<ViewType, string | null> = {
        blueprint: images?.blueprint || blueprintImg || null,
        render:    images?.render    || productImg || null,
        kv:        images?.kv        || null,
        lifestyle: images?.lifestyle || null,
        detail:    images?.detail    || null,
    };

    const currentConfig = VIEW_CONFIGS[selectedView] || VIEW_CONFIGS[0];
    const currentImage = viewDataMap[currentConfig.id];

    // 操作
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.0)); // 限制最大缩放，防止溢出太夸张
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
    const resetZoom = () => setZoom(1);

    const handleDownload = () => {
        if (!currentImage) return;
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `design_${currentConfig.id}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={cn(
            "flex flex-col gap-4 transition-all duration-300 bg-white border border-gray-200 rounded-xl shadow-sm",
            isFullscreen 
                ? "fixed inset-0 z-50 p-6 h-screen w-screen" 
                : "h-[750px] relative p-1" // 关键修改：固定高度 750px，防止撑破页面
        )}>
            {/* 1. 顶部工作栏 */}
            <div className="flex items-center justify-between shrink-0 px-4 py-2 bg-white border-b border-gray-100 rounded-t-xl">
                <div>
                    <h2 className="text-lg font-serif font-bold text-[#8B4513] flex items-center gap-3">
                        视觉工坊
                        {isSaved && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2 py-0.5 h-5 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> 已保存
                            </Badge>
                        )}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* 视图切换按钮组 */}
                    <div className="bg-gray-100/80 p-1 rounded-lg flex items-center gap-1">
                        {VIEW_CONFIGS.map((config, idx) => {
                            const isActive = selectedView === idx;
                            const hasImage = !!viewDataMap[config.id];
                            const showSeparator = idx === 2; // 在"实物"和"KV"之间加分隔线

                            return (
                                <React.Fragment key={config.id}>
                                    {showSeparator && <div className="w-px h-3 bg-gray-300 mx-1.5" />}
                                    
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => {
                                                        setSelectedView(idx);
                                                        resetZoom();
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                                                        isActive 
                                                            ? "bg-white text-[#8B4513] shadow-sm ring-1 ring-black/5" 
                                                            : "text-gray-500 hover:bg-white/50 hover:text-gray-900",
                                                        !hasImage && !isProcessing && "opacity-40"
                                                    )}
                                                >
                                                    <config.icon className="w-4 h-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{config.label}</p>
                                                <p className="text-[10px] text-gray-400">{config.resolution}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    
                    <Separator orientation="vertical" className="h-5 bg-gray-200" />

                    <div className="flex gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" size="icon" className={cn("h-8 w-8", showInfoPanel && "bg-gray-100 text-[#8B4513]")}
                                        onClick={() => setShowInfoPanel(!showInfoPanel)}
                                    >
                                        <Settings2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>参数面板</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" size="icon" className="h-8 w-8"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isFullscreen ? '退出全屏' : '全屏模式'}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* 2. 核心工作区 */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative">
                
                {/* 左侧：主画布 */}
                <Card className="flex-1 border-0 rounded-none shadow-none bg-[#F3F4F6] relative flex flex-col overflow-hidden group">
                    
                    {/* 画布工具栏 */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-lg shadow-sm p-1 flex flex-col gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomIn}>
                                <ZoomIn className="w-4 h-4 text-gray-700" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomOut}>
                                <ZoomOut className="w-4 h-4 text-gray-700" />
                            </Button>
                            <Separator className="my-1" />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn("h-8 w-8 rounded-md", showGrid && "bg-blue-50 text-blue-600")}
                                onClick={() => setShowGrid(!showGrid)}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* 画布内容 */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        {currentImage ? (
                            <ZoomableCanvas 
                                src={currentImage} 
                                alt={currentConfig.label} 
                                showGrid={showGrid}
                                zoom={zoom}
                                ratio={currentConfig.ratio}
                            />
                        ) : (
                            <div className="text-center p-12 max-w-md mx-auto flex flex-col items-center justify-center h-full">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-6 w-full">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-4 border-[#F5F5DC] border-t-[#8B4513] animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-[#8B4513] animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-center w-full">
                                            <h3 className="font-serif text-lg font-bold text-[#8B4513] animate-pulse">
                                                AI 正在绘制 {currentConfig.label}...
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                正在进行 {currentConfig.ratio === 'square' ? '1024x1024' : '1080x1920'} 高精渲染
                                            </p>
                                        </div>
                                        <GenerationLog />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-gray-400 opacity-60">
                                        <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 shadow-sm">
                                            <currentConfig.emptyIcon className="w-10 h-10 opacity-30" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg font-medium text-gray-600">
                                                等待生成
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {step === 'input' ? '请先在左侧完成概念设计' : '点击生成按钮开始渲染'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* 底部悬浮操作 */}
                        {currentImage && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1.5 bg-gray-900/85 backdrop-blur-md rounded-full shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-white hover:bg-white/20" onClick={handleDownload}>
                                    <Download className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-4 bg-white/20" />
                                <Button variant="ghost" size="sm" className="h-9 rounded-full text-white hover:bg-white/20 px-3 text-xs font-medium">
                                    <RefreshCw className="w-3 h-3 mr-2" /> 局部重绘
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 右侧：信息面板 (绝对定位覆盖，增加动画) */}
                <div 
                    className={cn(
                        "absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out z-40",
                        showInfoPanel ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center h-14 shrink-0">
                        <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#8B4513]" /> 视图详情
                        </h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowInfoPanel(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 bg-white">
                        <div className="p-5 space-y-6">
                            {/* 视图信息 */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specs</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-[10px] text-gray-400 block mb-1">尺寸</span>
                                        <span className="text-xs font-medium text-gray-700 font-mono">{currentConfig.resolution}</span>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-[10px] text-gray-400 block mb-1">比例</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {currentConfig.ratio === 'square' ? '1:1 Square' : '9:16 Vertical'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5DC]/30 p-3 rounded-lg border border-[#D4AF37]/20">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-white rounded-md shadow-sm text-[#8B4513]">
                                            <currentConfig.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-[#8B4513] block mb-0.5">{currentConfig.label}</span>
                                            <p className="text-[10px] text-[#8B4513]/70 leading-relaxed">
                                                {currentConfig.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* 模拟参数 */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Parameters</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Model Pipeline</span>
                                        <Badge variant="secondary" className="text-[10px] h-5">SDXL 1.0</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Sampler</span>
                                        <span className="font-mono text-gray-700">Euler a</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Seed</span>
                                        <span className="font-mono text-gray-700">39201482</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* 3. 底部全局操作栏 */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 rounded-b-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isSaved ? "bg-green-500" : "bg-amber-400")} />
                        <span className="text-xs font-medium text-gray-500">
                            {isSaved ? 'All changes saved' : 'Unsaved changes'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onSave} className="text-gray-600 hover:text-[#8B4513]">
                        <Save className="w-4 h-4 mr-2" /> 保存
                    </Button>
                    <Button variant="outline" size="sm" onClick={onAnalyze} disabled={isProcessing || !viewDataMap.render}>
                        <Sparkles className="w-4 h-4 mr-2" /> 商业分析
                    </Button>
                    <Button variant="outline" size="sm" onClick={onExport} disabled={!isSaved}>
                        <Download className="w-4 h-4 mr-2" /> 导出 PDF
                    </Button>
                    <Button size="sm" onClick={onPublish} disabled={!isSaved} className="bg-[#8B4513] text-white hover:bg-[#703810] shadow-sm">
                        <Upload className="w-4 h-4 mr-2" /> 发布设计
                    </Button>
                </div>
            </div>
        </div>
    );
}