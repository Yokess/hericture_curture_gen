import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    RefreshCw,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Users
} from 'lucide-react';
import { adminApi, type Successor, type HeritageProject } from '@/api/admin';
import { SuccessorEditDialog } from '@/components/admin/SuccessorEditDialog';

export default function SuccessorManagement() {
    const [successors, setSuccessors] = useState<Successor[]>([]);
    const [projects, setProjects] = useState<HeritageProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 编辑对话框状态
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedSuccessor, setSelectedSuccessor] = useState<Successor | null>(null);

    // 加载项目列表(用于下拉选择)
    const loadProjects = async () => {
        try {
            const result = await adminApi.listHeritageProjects({ page: 0, size: 1000 });
            setProjects(result.content);
        } catch (error: any) {
            console.error('加载项目列表失败:', error);
        }
    };

    // 加载传承人列表
    const loadSuccessors = async () => {
        setLoading(true);
        try {
            const result = await adminApi.listSuccessors({
                page,
                size: 10,
                keyword: searchKeyword || undefined,
                projectId: selectedProjectId ? parseInt(selectedProjectId) : undefined,
            });
            setSuccessors(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (error: any) {
            console.error('加载传承人列表失败:', error);
            alert('加载失败: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        loadSuccessors();
    }, [page]);

    // 搜索
    const handleSearch = () => {
        setPage(0);
        loadSuccessors();
    };

    // 新建传承人
    const handleCreate = () => {
        setSelectedSuccessor(null);
        setEditDialogOpen(true);
    };

    // 编辑传承人
    const handleEdit = (successor: Successor) => {
        setSelectedSuccessor(successor);
        setEditDialogOpen(true);
    };

    // 保存传承人
    const handleSave = async (data: Partial<Successor>) => {
        try {
            if (selectedSuccessor) {
                await adminApi.updateSuccessor(selectedSuccessor.id, data);
                alert('修改成功');
            } else {
                await adminApi.createSuccessor(data);
                alert('创建成功');
            }
            loadSuccessors();
        } catch (error: any) {
            alert('操作失败: ' + (error.response?.data?.message || error.message));
            throw error;
        }
    };

    // 删除传承人
    const handleDelete = async (successor: Successor) => {
        if (!confirm(`确定要删除传承人 "${successor.name}" 吗? 此操作不可恢复!`)) {
            return;
        }

        try {
            await adminApi.deleteSuccessor(successor.id);
            alert('删除成功');
            loadSuccessors();
        } catch (error: any) {
            alert('删除失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 获取项目名称
    const getProjectName = (projectId: number) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : '未知项目';
    };

    // 格式化日期
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-CN');
    };

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">传承人管理</h1>
                    <p className="text-gray-600 mt-1">管理非物质文化遗产传承人信息</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">总传承人数</span>
                    <p className="text-2xl font-bold text-[#8B4513]">{totalElements}</p>
                </div>
            </div>

            {/* 操作栏 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="搜索传承人姓名..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-md"
                        />
                        <Select value={selectedProjectId || ''} onValueChange={(value) => setSelectedProjectId(value || undefined)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="全部项目" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => loadSuccessors()} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新建传承人
                        </Button>
                    </div>
                </div>
            </div>

            {/* 传承人列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
                        <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#8B4513]/10 to-[#D4AF37]/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">姓名</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">关联项目</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">性别</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">出生年份</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">创建时间</th>
                                    <th className="px-5 py-4 text-right text-sm font-semibold text-[#8B4513]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {successors.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            暂无传承人数据
                                        </td>
                                    </tr>
                                ) : (
                                    successors.map((successor) => (
                                        <tr key={successor.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{successor.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {getProjectName(successor.projectId)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {successor.gender || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {successor.birthYear || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(successor.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/10"
                                                        title="编辑传承人"
                                                        onClick={() => handleEdit(successor)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="删除传承人"
                                                        onClick={() => handleDelete(successor)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 分页控制 */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            显示 {successors.length} 条,共 {totalElements} 条
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                上一页
                            </Button>
                            <span className="flex items-center px-2 text-sm text-gray-600">
                                第 {page + 1} / {totalPages} 页
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <SuccessorEditDialog
                open={editDialogOpen}
                successor={selectedSuccessor}
                projects={projects}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
