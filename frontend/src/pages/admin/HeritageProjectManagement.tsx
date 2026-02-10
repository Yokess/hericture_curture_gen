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
    FileText
} from 'lucide-react';
import { adminApi, type HeritageProject } from '@/api/admin';
import { ProjectEditDialog } from '@/components/admin/ProjectEditDialog';

export default function HeritageProjectManagement() {
    const [projects, setProjects] = useState<HeritageProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 编辑对话框状态
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<HeritageProject | null>(null);

    // 加载项目列表
    const loadProjects = async () => {
        setLoading(true);
        try {
            const result = await adminApi.listHeritageProjects({
                page,
                size: 10,
                keyword: searchKeyword || undefined,
                category: selectedCategory,
            });
            setProjects(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (error: any) {
            console.error('加载项目列表失败:', error);
            alert('加载失败: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [page]);

    // 搜索
    const handleSearch = () => {
        setPage(0);
        loadProjects();
    };

    // 新建项目
    const handleCreate = () => {
        setSelectedProject(null);
        setEditDialogOpen(true);
    };

    // 编辑项目
    const handleEdit = (project: HeritageProject) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    // 保存项目
    const handleSave = async (data: Partial<HeritageProject>) => {
        try {
            if (selectedProject) {
                await adminApi.updateHeritageProject(selectedProject.id, data);
                alert('修改成功');
            } else {
                await adminApi.createHeritageProject(data);
                alert('创建成功');
            }
            loadProjects();
        } catch (error: any) {
            alert('操作失败: ' + (error.response?.data?.message || error.message));
            throw error;
        }
    };

    // 删除项目
    const handleDelete = async (project: HeritageProject) => {
        if (!confirm(`确定要删除项目 "${project.name}" 吗? 此操作不可恢复!`)) {
            return;
        }

        try {
            await adminApi.deleteHeritageProject(project.id);
            alert('删除成功');
            loadProjects();
        } catch (error: any) {
            alert('删除失败: ' + (error.response?.data?.message || error.message));
        }
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
                    <h1 className="text-3xl font-bold text-gray-900">非遗项目管理</h1>
                    <p className="text-gray-600 mt-1">管理非物质文化遗产项目信息</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">总项目数</span>
                    <p className="text-2xl font-bold text-[#8B4513]">{totalElements}</p>
                </div>
            </div>

            {/* 操作栏 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="搜索项目名称、官方ID..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-md"
                        />
                        <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || undefined)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="全部类别" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="民间文学">民间文学</SelectItem>
                                <SelectItem value="传统音乐">传统音乐</SelectItem>
                                <SelectItem value="传统舞蹈">传统舞蹈</SelectItem>
                                <SelectItem value="传统戏剧">传统戏剧</SelectItem>
                                <SelectItem value="曲艺">曲艺</SelectItem>
                                <SelectItem value="传统体育、游艺与杂技">传统体育、游艺与杂技</SelectItem>
                                <SelectItem value="传统美术">传统美术</SelectItem>
                                <SelectItem value="传统技艺">传统技艺</SelectItem>
                                <SelectItem value="传统医药">传统医药</SelectItem>
                                <SelectItem value="民俗">民俗</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => loadProjects()} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新建项目
                        </Button>
                    </div>
                </div>
            </div>

            {/* 项目列表 */}
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">项目名称</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">官方ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">类别</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">地区</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">批次</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">创建时间</th>
                                    <th className="px-5 py-4 text-right text-sm font-semibold text-[#8B4513]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            暂无项目数据
                                        </td>
                                    </tr>
                                ) : (
                                    projects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{project.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {project.officialId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.location || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.batch || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(project.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/10"
                                                        title="编辑项目"
                                                        onClick={() => handleEdit(project)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="删除项目"
                                                        onClick={() => handleDelete(project)}
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
                            显示 {projects.length} 条,共 {totalElements} 条
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

            <ProjectEditDialog
                open={editDialogOpen}
                project={selectedProject}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
