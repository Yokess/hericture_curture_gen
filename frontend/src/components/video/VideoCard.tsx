import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';

interface VideoCardProps {
    id: string;
    title: string;
    project: string;
    duration: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'pending';
    progress?: number;
}

export function VideoCard({
    title,
    project,
    duration,
    uploadDate,
    status,
    progress = 0,
}: VideoCardProps) {
    const statusConfig = {
        processing: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
        completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
        pending: { label: '待处理', color: 'bg-gray-100 text-gray-700' },
    };

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
            {/* 视频缩略图 */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <Play className="w-16 h-16 text-gray-400" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {duration}
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{title}</h3>
                    <Badge className={statusConfig[status].color}>{statusConfig[status].label}</Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3">{project}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{uploadDate}</span>
                    </div>
                    {status === 'processing' && (
                        <span className="text-blue-600 font-medium">{progress}%</span>
                    )}
                </div>

                {/* 处理进度条 */}
                {status === 'processing' && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
