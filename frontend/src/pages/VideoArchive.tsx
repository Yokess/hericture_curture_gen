import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner'; // 建议添加反馈提示
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
    VideoArchiveHero,
    VideoUploadZone,
    VideoArchiveCard,
} from '@/components/archive'; // 假设你已经在 components/archive/index.ts 导出了这些组件
import { archiveApi, type VideoStatusResponse } from '@/api/archive';
import { authApi } from '@/api/auth';

const POLL_INTERVAL_MS = 3000;
const POLL_STATUSES = ['PENDING', 'PROCESSING'] as const;

export default function VideoArchive() {
    // 建议：如果 isAuthenticated 是动态的，最好使用 useAuth 钩子
    const isAuthenticated = authApi.isAuthenticated();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videos, setVideos] = useState<VideoStatusResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 1. 加载视频列表
    const loadVideos = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const list = await archiveApi.listMyVideos();
            setVideos(list ?? []);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '加载失败';
            // 首次加载失败仅打印日志或显示非阻塞错误，避免清空列表
            console.error(msg);
            toast.error('获取视频列表失败');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // 2. 轮询逻辑 (针对处理中的视频)
    const pollPendingVideos = useCallback(async () => {
        const pending = videos.filter((v) =>
            POLL_STATUSES.includes(v.status as (typeof POLL_STATUSES)[number])
        );
        if (pending.length === 0) return;

        // 并行查询状态
        await Promise.all(
            pending.map(async (v) => {
                try {
                    const resp = await archiveApi.getStatus(v.projectId);
                    setVideos((prev) =>
                        prev.map((item) =>
                            item.projectId === v.projectId ? resp : item
                        )
                    );
                } catch (e) {
                    console.error(`Poll failed for video ${v.projectId}`, e);
                }
            })
        );
    }, [videos]);

    // 初始加载
    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    // 设置轮询定时器
    useEffect(() => {
        const hasPending = videos.some((v) =>
            POLL_STATUSES.includes(v.status as (typeof POLL_STATUSES)[number])
        );

        if (!hasPending) {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }

        // 避免重复设置 timer
        if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(pollPendingVideos, POLL_INTERVAL_MS);
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [videos, pollPendingVideos]);

    // --- 事件处理 ---

    const handleUploadClick = () => {
        if (!isAuthenticated) {
            toast.error('请先登录');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (file: File) => {
        if (!isAuthenticated) return;

        // 简单校验
        if (file.size > 500 * 1024 * 1024) {
            toast.error('文件过大，请上传 500MB 以内的视频');
            return;
        }

        setUploading(true);
        setError(null);
        try {
            const resp = await archiveApi.uploadVideo(file);
            toast.success('上传成功，开始解析');

            const newVideo: VideoStatusResponse = {
                projectId: resp.projectId,
                status: 'PENDING',
                originalFilename: file.name,
                steps: []
            };
            // 插入到头部
            setVideos((prev) => [newVideo, ...prev]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '上传失败';
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
            // 重置 input 以便允许重复上传同一文件
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // [新增] 重试处理
    const handleRetry = async (projectId: number) => {
        try {
            await archiveApi.retryAnalysis(projectId);
            toast.success('已触发重试任务');

            // 乐观更新：将状态置为 PENDING，这样轮询器会自动接管
            setVideos((prev) =>
                prev.map((v) =>
                    v.projectId === projectId
                        ? { ...v, status: 'PENDING', errorMsg: null }
                        : v
                )
            );
        } catch (err) {
            console.error(err);
            toast.error('重试请求失败');
        }
    };

    // [新增] 删除处理
    const handleDelete = async (projectId: number) => {
        if (!window.confirm('确定要永久删除该视频档案吗？')) return;

        try {
            await archiveApi.deleteVideo(projectId);
            toast.success('删除成功');

            // 从列表中移除
            setVideos((prev) => prev.filter((v) => v.projectId !== projectId));
            // 如果删除的是当前展开项，关闭展开
            if (expandedId === projectId) setExpandedId(null);
        } catch (err) {
            console.error(err);
            toast.error('删除失败');
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
            <Navbar />

            {/* 这里的 ref 应该透传给内部的 input[type=file] */}
            <VideoUploadZone onFileSelected={handleFileSelected} ref={fileInputRef} />

            <main className="flex-grow">
                <VideoArchiveHero
                    onUploadClick={handleUploadClick}
                    uploading={uploading}
                />

                {/* 错误提示区域 */}
                {error && (
                    <section className="px-4 mt-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 border border-red-100 flex items-center">
                                <span className="mr-2">⚠️</span>
                                {error}
                            </div>
                        </div>
                    </section>
                )}

                {/* 视频列表区域 */}
                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {loading && videos.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 bg-white/50 rounded-xl">
                                <div className="animate-spin text-2xl mb-2">⏳</div>
                                <p>正在加载档案库...</p>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-lg mb-2">暂无视频档案</p>
                                <p className="text-sm">
                                    {isAuthenticated
                                        ? '点击上方「立即上传」开始数字化您的非遗技艺'
                                        : '请登录后查看您的视频档案'}
                                </p>
                            </div>
                        ) : (
                            videos.map((video) => (
                                <VideoArchiveCard
                                    key={video.projectId}
                                    video={video}
                                    isExpanded={expandedId === video.projectId}
                                    onToggleExpand={() =>
                                        setExpandedId((id) =>
                                            id === video.projectId ? null : video.projectId
                                        )
                                    }
                                    // 关键：传递新增的操作函数
                                    onRetry={handleRetry}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}