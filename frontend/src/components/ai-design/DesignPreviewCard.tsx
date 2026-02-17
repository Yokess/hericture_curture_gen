import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Palette, Scan, Bot, Save, Sparkles, Download, Upload } from 'lucide-react';

interface DesignPreviewCardProps {
    blueprintImg: string | null;
    productImg: string | null;
    selectedView: number;
    setSelectedView: (view: number) => void;
    isProcessing: boolean;
    step: string;
    // 操作栏相关 Props
    isSaved: boolean;
    onSave: () => void;
    onAnalyze: () => void;
    onExport: () => void;
    onPublish: () => void;
}

export function DesignPreviewCard({
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
    return (
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
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={onSave}>
                        <Save className="w-4 h-4 mr-2" /> 
                        {isSaved ? '已保存' : '保存设计'}
                    </Button>
                    <Button variant="outline" onClick={onAnalyze} disabled={isProcessing}>
                        <Sparkles className="w-4 h-4 mr-2" /> 
                        生成分析报告
                    </Button>
                    <Button variant="outline" onClick={onExport}>
                        <Download className="w-4 h-4 mr-2" /> 导出方案
                    </Button>
                    <Button className="bg-[#8B4513]" onClick={onPublish}>
                        <Upload className="w-4 h-4 mr-2" /> 发布设计
                    </Button>
                </div>
            )}
        </Card>
    );
}