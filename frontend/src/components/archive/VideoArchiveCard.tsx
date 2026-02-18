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
} from 'lucide-react';
import { ProcessStepCard } from './ProcessStepCard';
import type { VideoStatusResponse } from '@/api/archive';

interface VideoArchiveCardProps {
    video: VideoStatusResponse;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const POLL_STATUSES = ['PENDING', 'PROCESSING'] as const;

export function VideoArchiveCard({
    video,
    isExpanded,
    onToggleExpand,
}: VideoArchiveCardProps) {
    const status = video.status;
    const isProcessing = POLL_STATUSES.includes(status);

    const statusConfig = {
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

    const config = statusConfig[status] ?? statusConfig.PENDING;
    const StatusIcon = config.icon;
    const steps = video.steps ?? [];
    const title = video.originalFilename ?? `视频 #${video.projectId}`;

    return (
        <Card className="p-6">
            {/* 视频信息头部 */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4 flex-1">
                    {/* 视频缩略图 */}
                    <a
                        href={video.videoUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-48 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-90 transition-opacity"
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
                    </a>

                    {/* 视频详情 */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-serif text-2xl font-bold text-[#8B4513]">
                                {title}
                            </h3>
                            <Badge className={config.color}>
                                <StatusIcon
                                    className={`w-3 h-3 mr-1 ${
                                        isProcessing ? 'animate-spin' : ''
                                    }`}
                                />
                                {config.label}
                            </Badge>
                        </div>
                        {video.errorMsg && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{video.errorMsg}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {video.videoUrl && (
                                <a
                                    href={video.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 hover:text-[#8B4513]"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>播放视频</span>
                                </a>
                            )}
                            {steps.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4" />
                                    <span>{steps.length} 个工序</span>
                                </div>
                            )}
                        </div>

                        {/* 处理中状态 */}
                        {isProcessing && (
                            <div className="mt-4">
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-[#D4AF37] rounded-full animate-pulse" />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    正在分析视频内容...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 操作按钮 */}
                {status === 'COMPLETED' && steps.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={onToggleExpand}
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {isExpanded ? '收起详情' : '查看详情'}
                    </Button>
                )}
            </div>

            {/* 工序展示 */}
            {isExpanded && steps.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-serif text-lg font-semibold text-[#8B4513] mb-4">
                        提取的工序步骤
                    </h4>
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
