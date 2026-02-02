import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Upload,
    Trash2,
    Download,
    Search,
    RefreshCw,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    Database,
    MessageSquare,
    FolderOpen,
} from 'lucide-react';
import { knowledgebaseApi, type KnowledgeBaseItem, type KnowledgeBaseStats } from '@/api/knowledgebase';
import { FileUploadDialog } from '@/components/knowledgebase/FileUploadDialog';

export default function KnowledgeBase() {

    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([]);
    const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // 加载知识库列表
    const loadKnowledgeBases = async () => {
        setLoading(true);
        try {
            const data = await knowledgebaseApi.listKnowledgeBases();
            setKnowledgeBases(data);
        } catch (error: any) {
            console.error('加载知识库列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 加载统计信息
    const loadStats = async () => {
        try {
            const data = await knowledgebaseApi.getStatistics();
            setStats(data);
        } catch (error: any) {
            console.error('加载统计信息失败:', error);
        }
    };

    // 初始化加载
    useEffect(() => {
        loadKnowledgeBases();
        loadStats();
    }, []);

    // 搜索
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            loadKnowledgeBases();
            return;
        }

        setLoading(true);
        try {
            const data = await knowledgebaseApi.searchKnowledgeBases(searchKeyword);
            setKnowledgeBases(data);
        } catch (error: any) {
            console.error('搜索失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 删除知识库
    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`确定要删除知识库"${name}"吗?此操作不可恢复!`)) {
            return;
        }

        try {
            await knowledgebaseApi.deleteKnowledgeBase(id);
            alert('删除成功!');
            loadKnowledgeBases();
            loadStats();
        } catch (error: any) {
            alert('删除失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 下载知识库
    const handleDownload = async (id: number, filename: string) => {
        try {
            const blob = await knowledgebaseApi.downloadKnowledgeBase(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            alert('下载失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 重新向量化
    const handleRevectorize = async (id: number, name: string) => {
        if (!confirm(`确定要重新向量化"${name}"吗?`)) {
            return;
        }

        try {
            await knowledgebaseApi.revectorize(id);
            alert('已提交重新向量化任务!');
            loadKnowledgeBases();
        } catch (error: any) {
            alert('操作失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 上传成功回调
    const handleUploadSuccess = () => {
        setUploadDialogOpen(false);
        loadKnowledgeBases();
        loadStats();
    };

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // 格式化日期
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    // 向量化状态显示
    const getVectorStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已完成
                    </span>
                );
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        处理中
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        等待中
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        失败
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">知识库管理</h1>
                <p className="text-gray-600 mt-1">管理非遗知识库文件,支持智能问答</p>
            </div>

            {/* 统计卡片 */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">总知识库数</p>
                                <p className="text-3xl font-bold text-[#8B4513]">{stats.totalCount}</p>
                            </div>
                            <Database className="w-12 h-12 text-[#D4AF37]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">已向量化</p>
                                <p className="text-3xl font-bold text-green-600">{stats.vectorizedCount}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">问答次数</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</p>
                            </div>
                            <MessageSquare className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">分类数量</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.categoryCount}</p>
                            </div>
                            <FolderOpen className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* 操作栏 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="搜索知识库..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-md"
                        />
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={loadKnowledgeBases} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新
                        </Button>
                        <Button
                            onClick={() => setUploadDialogOpen(true)}
                            className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            上传知识库
                        </Button>
                    </div>
                </div>
            </div>

            {/* 知识库列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                        <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                ) : knowledgeBases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mb-4 text-gray-300" />
                        <p>暂无知识库</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#8B4513]/10 to-[#D4AF37]/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        名称
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        分类
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        大小
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        向量化状态
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        上传时间
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">
                                        问答次数
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#8B4513]">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {knowledgeBases.map((kb) => (
                                    <tr key={kb.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-[#8B4513] mr-2" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{kb.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {kb.originalFilename}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#8B4513]">
                                                {kb.category || '未分类'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatFileSize(kb.fileSize)}
                                        </td>
                                        <td className="px-6 py-4">{getVectorStatusBadge(kb.vectorStatus)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(kb.uploadedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {kb.questionCount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleDownload(kb.id, kb.originalFilename)
                                                    }
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                {kb.vectorStatus === 'FAILED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRevectorize(kb.id, kb.name)}
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(kb.id, kb.name)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 上传对话框 */}
            <FileUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}
