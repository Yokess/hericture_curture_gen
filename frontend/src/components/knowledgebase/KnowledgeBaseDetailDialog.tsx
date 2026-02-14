import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { knowledgebaseApi, type KnowledgeBaseItem } from '@/api/knowledgebase';
import { Loader2, FileText, Calendar, HardDrive, Eye, MessageSquare, Tag, CheckCircle, XCircle, Clock, Database } from 'lucide-react';

interface KnowledgeBaseDetailDialogProps {
    open: boolean;
    onClose: () => void;
    knowledgeBaseId: number;
}

export function KnowledgeBaseDetailDialog({
    open,
    onClose,
    knowledgeBaseId
}: KnowledgeBaseDetailDialogProps) {
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<KnowledgeBaseItem | null>(null);

    useEffect(() => {
        if (open && knowledgeBaseId) {
            loadDetail();
        }
    }, [open, knowledgeBaseId]);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const data = await knowledgebaseApi.getKnowledgeBase(knowledgeBaseId);
            setDetail(data);
        } catch (error: any) {
            console.error('加载详情失败:', error);
            alert('加载详情失败: ' + (error.response?.data?.message || error.message));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    const getVectorStatusInfo = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { icon: CheckCircle, text: '已完成', color: 'text-green-600', bgColor: 'bg-green-50' };
            case 'PROCESSING':
                return { icon: Loader2, text: '处理中', color: 'text-blue-600', bgColor: 'bg-blue-50' };
            case 'PENDING':
                return { icon: Clock, text: '等待中', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
            case 'FAILED':
                return { icon: XCircle, text: '失败', color: 'text-red-600', bgColor: 'bg-red-50' };
            default:
                return { icon: Clock, text: '未知', color: 'text-gray-600', bgColor: 'bg-gray-50' };
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#8B4513]" />
                        知识库详情
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                        <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                ) : detail ? (
                    <div className="space-y-6 py-4">
                        {/* 基本信息 */}
                        <div className="bg-gradient-to-r from-[#8B4513]/5 to-[#D4AF37]/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#8B4513] mb-3">基本信息</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">知识库名称</div>
                                    <div className="font-medium text-gray-900">{detail.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">原始文件名</div>
                                    <div className="font-medium text-gray-900">{detail.originalFilename}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        分类
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {detail.category || '未分类'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">文件类型</div>
                                    <div className="font-medium text-gray-900">{detail.contentType}</div>
                                </div>
                            </div>
                        </div>

                        {/* 向量化状态 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-lg font-semibold text-[#8B4513] mb-3">向量化状态</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">状态</div>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const statusInfo = getVectorStatusInfo(detail.vectorStatus);
                                            const Icon = statusInfo.icon;
                                            return (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                    <Icon className={`w-4 h-4 mr-1 ${detail.vectorStatus === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                                    {statusInfo.text}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                {detail.chunkCount !== undefined && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                            <Database className="w-3 h-3" />
                                            分块数量
                                        </div>
                                        <div className="font-medium text-gray-900">{detail.chunkCount}</div>
                                    </div>
                                )}
                            </div>
                            {detail.vectorError && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    <strong>错误信息：</strong> {detail.vectorError}
                                </div>
                            )}
                        </div>

                        {/* 统计信息 */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <HardDrive className="w-4 h-4" />
                                    <span className="text-sm">文件大小</span>
                                </div>
                                <div className="text-2xl font-bold text-[#8B4513]">
                                    {formatFileSize(detail.fileSize)}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm">访问次数</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {detail.accessCount}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-sm">问答次数</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {detail.questionCount}
                                </div>
                            </div>
                        </div>

                        {/* 时间信息 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">上传时间</span>
                            </div>
                            <div className="text-gray-900">{formatDate(detail.uploadedAt)}</div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

