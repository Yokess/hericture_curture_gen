import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Video,
    FileText,
    Clock,
    CheckCircle2,
    Loader2,
    Eye,
    Play,
    XCircle,
    AlertCircle,
    RotateCcw, // 新增：重试图标
    Trash2,    // 新增：删除图标
} from 'lucide-react';
import { ProcessStepCard } from './ProcessStepCard';
import type { VideoStatusResponse } from '@/api/archive';

interface VideoArchiveCardProps {
    video: VideoStatusResponse;
    isExpanded: boolean;
    onToggleExpand: () => void;
    // 新增回调函数
    onRetry: (id: number) => void;
    onDelete: (id: number) => void;
}

const POLL_STATUSES = ['PENDING', 'PROCESSING'] as const;

export function VideoArchiveCard({
                                     video,
                                     isExpanded,
                                     onToggleExpand,
                                     onRetry,
                                     onDelete,
                                 }: VideoArchiveCardProps) {
    const status = video.status;
    const isProcessing = POLL_STATUSES.includes(status as any);

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        COMPLETED: {
            label: '已完成',
            color: 'bg-green-100 text-green-700',
            icon: CheckCircle2,
        },
        PROCESSING: {
            label: '处理中',
            color: 'bg-yellow-100 text-yellow-700',
            icon: Loader2,
        },
        PENDING: {
            label: '待处理',
            color: 'bg-gray-100 text-gray-700',
            icon: Clock,
        },
        FAILED: {
            label: '失败',
            color: 'bg-red-100 text-red-700',
            icon: XCircle,
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const StatusIcon = config.icon;
    const steps = video.steps ?? [];
    const title = video.originalFilename ?? `视频 #${video.projectId}`;

    return (
        <Card className="p-6 transition-all hover:shadow-md">
            {/* 视频信息头部 */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4 flex-1">
                    {/* 视频缩略图 */}
                    <div className="relative group">
                        <a
                            href={video.videoUrl ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-48 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                        >
                            {video.videoUrl ? (
                                <video
                                    src={video.videoUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                />
                            ) : (
                                <Video className="w-12 h-12 text-[#8B4513]" />
                            )}

                            {/* 播放悬停遮罩 */}
                            {video.videoUrl && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                                </div>
                            )}
                        </a>
                    </div>

                    {/* 视频详情 */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-serif text-2xl font-bold text-[#8B4513] truncate max-w-md" title={title}>
                                {title}
                            </h3>
                            <Badge className={`${config.color} border-0`}>
                                <StatusIcon
                                    className={`w-3 h-3 mr-1 ${
                                        isProcessing ? 'animate-spin' : ''
                                    }`}
                                />
                                {config.label}
                            </Badge>
                        </div>

                        {/* 错误提示 */}
                        {video.errorMsg && (
                            <div className="flex items-start gap-2 text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-md border border-red-100">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="break-all">{video.errorMsg}</span>
                            </div>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {steps.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4" />
                                    <span>{steps.length} 个工序</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>ID: {video.projectId}</span>
                            </div>
                        </div>

                        {/* 处理中进度条动画 */}
                        {isProcessing && (
                            <div className="mt-4 max-w-md">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-[#D4AF37] rounded-full animate-progress-indeterminate" />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    AI 正在逐帧分析工艺流程...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 操作按钮组 --- */}
                <div className="flex flex-col gap-2 ml-4">
                    {/* 查看详情按钮 */}
                    {status === 'COMPLETED' && steps.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={onToggleExpand}
                            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white w-full justify-start"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {isExpanded ? '收起详情' : '查看详情'}
                        </Button>
                    )}

                    {/* 重试按钮 (仅失败时显示) */}
                    {status === 'FAILED' && (
                        <Button
                            variant="outline"
                            onClick={() => onRetry(video.projectId)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-full justify-start"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            重试任务
                        </Button>
                    )}

                    {/* 删除按钮 (常驻) */}
                    <Button
                        variant="ghost"
                        onClick={() => onDelete(video.projectId)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-full justify-start"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                    </Button>
                </div>
            </div>

            {/* 工序展示区域 */}
            {isExpanded && steps.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-serif text-lg font-semibold text-[#8B4513]">
                            提取的工序步骤
                        </h4>
                        <span className="text-xs text-gray-400">
                            共 {steps.length} 个关键节点
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {steps.map((step) => (
                            <ProcessStepCard key={step.id} step={step} />
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}