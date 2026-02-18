import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
    VideoArchiveHero,
    VideoUploadZone,
    VideoArchiveCard,
} from '@/components/archive';
import { archiveApi, type VideoStatusResponse } from '@/api/archive';
import { authApi } from '@/api/auth';

const POLL_INTERVAL_MS = 3000;
const POLL_STATUSES = ['PENDING', 'PROCESSING'] as const;

export default function VideoArchive() {
    const isAuthenticated = authApi.isAuthenticated();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videos, setVideos] = useState<VideoStatusResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 加载视频列表
    const loadVideos = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const list = await archiveApi.listMyVideos();
            setVideos(list ?? []);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '加载失败';
            setError(msg);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // 轮询进行中的视频状态
    const pollPendingVideos = useCallback(async () => {
        const pending = videos.filter((v) =>
            POLL_STATUSES.includes(v.status as (typeof POLL_STATUSES)[number])
        );
        if (pending.length === 0) return;

        for (const v of pending) {
            try {
                const resp = await archiveApi.getStatus(v.projectId);
                setVideos((prev) =>
                    prev.map((item) =>
                        item.projectId === v.projectId ? resp : item
                    )
                );
            } catch {
                // 忽略单次轮询错误
            }
        }
    }, [videos]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

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

        pollTimerRef.current = setInterval(pollPendingVideos, POLL_INTERVAL_MS);
        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [videos, pollPendingVideos]);

    const handleUploadClick = () => {
        if (!isAuthenticated) {
            setError('请先登录');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (file: File) => {
        if (!isAuthenticated) return;
        setUploading(true);
        setError(null);
        try {
            const resp = await archiveApi.uploadVideo(file);
            const newVideo: VideoStatusResponse = {
                projectId: resp.projectId,
                status: 'PENDING',
                originalFilename: file.name,
            };
            setVideos((prev) => [newVideo, ...prev]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '上传失败';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            <VideoUploadZone onFileSelected={handleFileSelected} ref={fileInputRef} />
            <VideoArchiveHero
                onUploadClick={handleUploadClick}
                uploading={uploading}
            />

            {/* 错误提示 */}
            {error && (
                <section className="px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 mb-6">
                            {error}
                        </div>
                    </div>
                </section>
            )}

            {/* 视频列表 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center py-16 text-gray-500">
                            加载中...
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            {isAuthenticated
                                ? '暂无视频档案，点击上方「上传视频」开始'
                                : '请登录后查看您的视频档案'}
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
                            />
                        ))
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
