import { useState, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Upload,
    Video,
    Clock,
    FileText,
    CheckCircle2,
    Loader2,
    Eye,
    Play
} from 'lucide-react';

interface ProcessStep {
    stepNumber: number;
    name: string;
    description: string;
    timestamp: string;
}

interface VideoItem {
    id: string;
    title: string;
    project: string;
    uploadDate: string;
    fileSize: string;
    duration: string;
    status: 'completed' | 'processing' | 'pending';
    progress?: number;
    stepsCount?: number;
    steps?: ProcessStep[];
}

export default function VideoArchive() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videos, setVideos] = useState<VideoItem[]>([
        {
            id: '1',
            title: '景德镇拉坯技艺',
            project: '景德镇传统手工制瓷技艺',
            uploadDate: '2026-01-10',
            fileSize: '150 MB',
            duration: '4:40',
            status: 'completed',
            stepsCount: 3,
            steps: [
                {
                    stepNumber: 1,
                    name: '揉泥',
                    description: '将瓷土反复揉搓,排除气泡,使泥料均匀细腻,为拉坯做准备。',
                    timestamp: '00:00 - 00:45'
                },
                {
                    stepNumber: 2,
                    name: '拉坯',
                    description: '将泥料置于转盘中心,双手配合,边旋转边向上提拉,塑造器型。',
                    timestamp: '00:45 - 03:00'
                },
                {
                    stepNumber: 3,
                    name: '修坯',
                    description: '待坯体半干后,用刀具修整器型,使壁厚均匀,线条流畅。',
                    timestamp: '03:00 - 04:40'
                }
            ]
        },
        {
            id: '2',
            title: '蔚县剪纸制作全程',
            project: '剪纸(蔚县剪纸)',
            uploadDate: '2026-01-12',
            fileSize: '94 MB',
            duration: '6:00',
            status: 'completed',
            stepsCount: 3
        },
        {
            id: '3',
            title: '苗族古歌演唱',
            project: '苗族古歌',
            uploadDate: '2026-01-20',
            fileSize: '50 MB',
            duration: '3:20',
            status: 'processing',
            progress: 65
        }
    ]);

    const [expandedVideo, setExpandedVideo] = useState<string | null>('1');

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            // 模拟上传
            const newVideo: VideoItem = {
                id: Date.now().toString(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                project: '待分类',
                uploadDate: new Date().toISOString().split('T')[0],
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                duration: '0:00',
                status: 'processing',
                progress: 0
            };
            setVideos([newVideo, ...videos]);

            // 模拟进度更新
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress > 100) {
                    clearInterval(interval);
                    setVideos(prev => prev.map(v =>
                        v.id === newVideo.id
                            ? { ...v, status: 'completed', progress: 100, stepsCount: 3 }
                            : v
                    ));
                } else {
                    setVideos(prev => prev.map(v =>
                        v.id === newVideo.id
                            ? { ...v, progress }
                            : v
                    ));
                }
            }, 500);
        }
    };

    const statusConfig = {
        completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        processing: { label: '处理中', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
        pending: { label: '待处理', color: 'bg-gray-100 text-gray-700', icon: Clock }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* 页面标题 */}
            <section className="pt-32 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">
                                技艺数字化档案
                            </h1>
                            <p className="text-xl text-gray-600">
                                AI 自动提取视频工序,结构化展示非遗技艺传承过程
                            </p>
                        </div>
                        <Button
                            onClick={handleUploadClick}
                            className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                            size="lg"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            上传视频
                        </Button>
                    </div>
                </div>
            </section>

            {/* 视频列表 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    {videos.map((video) => {
                        const StatusIcon = statusConfig[video.status].icon;
                        const isExpanded = expandedVideo === video.id;

                        return (
                            <Card key={video.id} className="p-6">
                                {/* 视频信息头部 */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-start space-x-4 flex-1">
                                        {/* 视频缩略图 */}
                                        <div className="w-48 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Video className="w-12 h-12 text-[#8B4513]" />
                                        </div>

                                        {/* 视频详情 */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-serif text-2xl font-bold text-[#8B4513]">
                                                    {video.title}
                                                </h3>
                                                <Badge className={statusConfig[video.status].color}>
                                                    <StatusIcon className={`w-3 h-3 mr-1 ${video.status === 'processing' ? 'animate-spin' : ''}`} />
                                                    {statusConfig[video.status].label}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 mb-3">
                                                {video.project} • 上传于 {video.uploadDate}
                                            </p>
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{video.fileSize}</span>
                                                </div>
                                                {video.stepsCount && (
                                                    <div className="flex items-center space-x-2">
                                                        <Play className="w-4 h-4" />
                                                        <span>{video.stepsCount} 个工序</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{video.duration}</span>
                                                </div>
                                            </div>

                                            {/* 处理进度 */}
                                            {video.status === 'processing' && video.progress !== undefined && (
                                                <div className="mt-4">
                                                    <Progress value={video.progress} className="h-2" />
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        正在分析视频内容... {video.progress}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    {video.status === 'completed' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setExpandedVideo(isExpanded ? null : video.id)}
                                            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            {isExpanded ? '收起详情' : '查看详情'}
                                        </Button>
                                    )}
                                </div>

                                {/* 工序展示 */}
                                {isExpanded && video.steps && (
                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="font-serif text-lg font-semibold text-[#8B4513] mb-4">
                                            提取的工序步骤
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {video.steps.map((step) => (
                                                <Card
                                                    key={step.stepNumber}
                                                    className="bg-[#F5F5DC] p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                                                >
                                                    {/* 关键帧缩略图 */}
                                                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-2">
                                                                <Play className="w-6 h-6 text-[#8B4513]" />
                                                            </div>
                                                            <p className="text-xs text-[#8B4513]">关键帧</p>
                                                        </div>
                                                    </div>

                                                    {/* 工序信息 */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-serif font-semibold text-[#8B4513]">
                                                            {step.stepNumber}. {step.name}
                                                        </h5>
                                                        <span className="text-xs text-gray-500">{step.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{step.description}</p>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </div>
    );
}
