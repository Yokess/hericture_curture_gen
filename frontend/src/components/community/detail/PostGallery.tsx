import { useEffect, useMemo, useState } from 'react';
import { 
    Maximize2, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    Download,
    ImageIcon,
    Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// --- 类型定义 ---

interface ArtifactImage {
    id: string;
    url: string;
    type: 'KV' | 'LIFESTYLE' | 'DETAIL' | 'PRODUCT' | 'BLUEPRINT';
    label: string;
    description?: string;
}

interface PostGalleryProps {
    artifact: {
        kvUrl?: string | null;
        lifestyleUrl?: string | null;
        detailUrl?: string | null;
        productShotUrl?: string | null;
        blueprintUrl?: string | null;
        designName?: string | null;
    } | null;
    title: string;
    className?: string;
}

// --- 辅助组件：图片加载器 ---
// 实现高级的 Blur-up 效果：先加载低质量或占位，加载完成后平滑过渡
const ProgressiveImage = ({ 
    src, 
    alt, 
    className
}: { 
    src: string; 
    alt: string; 
    className?: string; 
}) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={cn("overflow-hidden bg-secondary/20 relative w-full h-full", className)}>
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-all duration-700 ease-in-out",
                    isLoading ? "scale-110 blur-xl opacity-0" : "scale-100 blur-0 opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-8 h-8 text-muted-foreground/20 animate-pulse" />
                </div>
            )}
        </div>
    );
};

// --- 主组件 ---

export function PostGallery({ artifact, title, className }: PostGalleryProps) {
    // 1. 数据转换与清洗
    const images = useMemo<ArtifactImage[]>(() => {
        if (!artifact) return [];
        const imgs: ArtifactImage[] = [];
        
        if (artifact.kvUrl) imgs.push({ id: 'kv', url: artifact.kvUrl, type: 'KV', label: '主视觉海报', description: 'Key Visual Design' });
        if (artifact.lifestyleUrl) imgs.push({ id: 'life', url: artifact.lifestyleUrl, type: 'LIFESTYLE', label: '场景应用', description: 'Lifestyle Usage' });
        if (artifact.productShotUrl) imgs.push({ id: 'prod', url: artifact.productShotUrl, type: 'PRODUCT', label: '产品渲染', description: 'Product Rendering' });
        if (artifact.detailUrl) imgs.push({ id: 'detail', url: artifact.detailUrl, type: 'DETAIL', label: '细节特写', description: 'Close-up Details' });
        if (artifact.blueprintUrl) imgs.push({ id: 'blue', url: artifact.blueprintUrl, type: 'BLUEPRINT', label: '设计草图', description: 'Design Blueprint' });
        
        return imgs;
    }, [artifact]);

    // 2. 状态管理
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // 3. 键盘导航逻辑
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'Escape') setLightboxOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentIndex]); // eslint-disable-line

    const navigate = (direction: number) => {
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;
        setCurrentIndex(newIndex);
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `design-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (images.length === 0) {
        return (
            <div className="w-full aspect-video bg-secondary/10 rounded-xl border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="p-4 bg-background rounded-full shadow-sm">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
                <p>暂无设计图片</p>
            </div>
        );
    }

    // --- 渲染部分 ---

    return (
        <div className={cn("space-y-4", className)}>
            {/* Bento Grid 布局系统 
               根据图片数量动态调整网格样式，营造杂志般的排版感
            */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
                {images.map((img, index) => {
                    // 动态计算每个图片在网格中的跨度
                    let colSpan = "md:col-span-1";
                    let rowSpan = "row-span-1";

                    if (images.length === 1) {
                        colSpan = "md:col-span-4";
                        rowSpan = "row-span-2";
                    } else if (images.length === 2) {
                        colSpan = "md:col-span-2";
                        rowSpan = "row-span-2";
                    } else if (images.length === 3) {
                        if (index === 0) { colSpan = "md:col-span-2"; rowSpan = "row-span-2"; }
                        else { colSpan = "md:col-span-2"; rowSpan = "row-span-1"; }
                    } else if (images.length >= 4) {
                        // 第一张图作为 Hero Image
                        if (index === 0) { colSpan = "md:col-span-2"; rowSpan = "row-span-2"; }
                        else if (index === 1 || index === 2) { colSpan = "md:col-span-2"; rowSpan = "row-span-1"; }
                        else { colSpan = "md:col-span-1"; rowSpan = "row-span-1"; }
                    }

                    return (
                        <div 
                            key={img.id}
                            className={cn(
                                "group relative rounded-2xl overflow-hidden cursor-zoom-in border border-border/50 shadow-sm bg-background transition-all hover:shadow-md",
                                colSpan,
                                rowSpan
                            )}
                            onClick={() => {
                                setCurrentIndex(index);
                                setLightboxOpen(true);
                            }}
                        >
                            {/* 图片容器 */}
                            <div className="w-full h-full">
                                <ProgressiveImage 
                                    src={img.url} 
                                    alt={img.label} 
                                    className="transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* 悬浮遮罩与信息 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur hover:bg-white mb-2 border-0">
                                        {img.type}
                                    </Badge>
                                    <h4 className="text-white font-medium text-sm drop-shadow-md">{img.label}</h4>
                                </div>
                                <div className="absolute top-4 right-4 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur border-white/20 text-white hover:bg-white hover:text-black">
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 高级全屏 Lightbox 
               使用 Dialog Primitive 构建自定义的沉浸式浏览体验
            */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-0 bg-black/95 backdrop-blur-xl z-[9999] flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    
                    {/* 顶部工具栏 */}
                    <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white/90">
                            <h3 className="text-lg font-serif font-semibold tracking-wide">
                                {images[currentIndex]?.label}
                            </h3>
                            <p className="text-xs text-white/50 font-mono uppercase tracking-wider">
                                {title} • {images[currentIndex]?.description} • {currentIndex + 1} / {images.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                            onClick={(e) => { e.stopPropagation(); handleDownload(images[currentIndex].url); }}
                                        >
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>下载原图</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                onClick={() => setLightboxOpen(false)}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* 主视图区域 */}
                    <div className="flex-1 relative flex items-center justify-center w-full h-full overflow-hidden group">
                        {/* 左侧导航按钮 */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 z-40 h-12 w-12 rounded-full bg-black/20 text-white/70 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        {/* 主图 */}
                        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                             <img
                                key={images[currentIndex].id} // Key change triggers animation
                                src={images[currentIndex].url}
                                alt={images[currentIndex].label}
                                className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                            />
                        </div>

                        {/* 右侧导航按钮 */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 z-40 h-12 w-12 rounded-full bg-black/20 text-white/70 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={(e) => { e.stopPropagation(); navigate(1); }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* 底部缩略图导航 */}
                    <div className="h-24 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-center z-50">
                        <ScrollArea className="w-full max-w-4xl whitespace-nowrap px-4">
                            <div className="flex items-center justify-center gap-3 p-4 min-w-max">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={cn(
                                            "relative h-14 aspect-[4/3] rounded-md overflow-hidden transition-all duration-300 border-2",
                                            currentIndex === idx 
                                                ? "border-[#D4AF37] scale-110 opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                                                : "border-transparent opacity-50 hover:opacity-80 hover:scale-105"
                                        )}
                                    >
                                        <img 
                                            src={img.url} 
                                            alt={img.label} 
                                            className="w-full h-full object-cover"
                                        />
                                        {/* 激活状态指示点 */}
                                        {currentIndex === idx && (
                                            <div className="absolute inset-0 bg-[#D4AF37]/10" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
}

// -----------------------------------------------------------------------------
// 设计思路说明：
// 1. **Bento Grid (便当盒布局)**: 
//    代码中通过 `col-span` 和 `row-span` 的动态计算逻辑，实现了根据图片数量(1~5+)
//    自动变化的非对称网格。这比普通的 Grid 或 Carousel 看起来更具“杂志感”和“设计感”。
//    - 1张图：全宽展示，冲击力强。
//    - 4张+图：左上角大图(Hero) + 周围小图环绕，主次分明。

// 2. **Progressive Blur-up (渐进式加载)**:
//    `ProgressiveImage` 组件利用 `isLoading` 状态和 CSS `blur` 滤镜，
//    模拟了像 Medium 或 Unsplash 那样的高级加载体验，避免了图片未加载时的白屏闪烁。

// 3. **Immersive Lightbox (沉浸式灯箱)**:
//    重写了 Dialog 的 Content，移除了默认的 padding 和关闭按钮，
//    使用了 `bg-black/95` 和 `backdrop-blur-xl` 营造影院级黑场体验。
//    底部增加了缩略图导航条 (Thumbnail Strip)，支持点击快速跳转，
//    当前选中的缩略图会有金色高亮 (`#D4AF37`) 和发光效果，呼应全站主题色。

// 4. **Micro-Interactions (微交互)**:
//    - 鼠标悬停网格图片时，遮罩层渐变出现，标签上浮，图片轻微放大。
//    - 切换大图时加入了 `animate-in fade-in zoom-in-95` 动画。
//    - 左右导航箭头默认隐藏，悬停时才显现，保持界面极简干净。

// 5. **Typography & Metadata**:
//    在 Lightbox 顶部保留了衬线字体 (`font-serif`) 的标题展示，
//    并配以等宽字体 (`font-mono`) 展示图片描述和索引，强化“档案”与“专业”的视觉隐喻。
// -----------------------------------------------------------------------------
