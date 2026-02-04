import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    RefreshCw,
    User as UserIcon,
    Shield,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adminApi, type User } from '@/api/admin';
import { UserEditDialog } from '@/components/admin/UserEditDialog';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 编辑对话框状态
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 加载用户列表
    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await adminApi.listUsers({
                page,
                size: 10,
                keyword: searchKeyword || undefined
            });
            setUsers(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (error: any) {
            console.error('加载用户列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page]); // 仅当页码变化时自动加载

    // 搜索
    const handleSearch = () => {
        setPage(0); // 重置到第一页
        loadUsers();
    };

    // 切换状态（禁用/启用）
    const handleToggleStatus = async (user: User) => {
        const action = user.enabled ? '禁用' : '启用';
        if (!confirm(`确定要${action}用户 "${user.nickname || user.username}" 吗?`)) {
            return;
        }

        try {
            await adminApi.toggleUserStatus(user.id, !user.enabled);
            alert(`${action}成功`);
            loadUsers();
        } catch (error: any) {
            alert('操作失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 删除用户
    const handleDelete = async (user: User) => {
        if (!confirm(`警告: 确定要永久删除用户 "${user.nickname || user.username}" 吗? 此操作不可恢复!`)) {
            return;
        }

        try {
            await adminApi.deleteUser(user.id);
            alert('删除成功');
            loadUsers();
        } catch (error: any) {
            alert('删除失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 打开编辑权限对话框
    const handleEditRole = (user: User) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    // 保存权限更改
    const handleSaveRole = async (userId: number, isAdmin: boolean) => {
        try {
            await adminApi.setUserRole(userId, isAdmin);
            alert('权限修改成功');
            loadUsers();
        } catch (error: any) {
            alert('修改失败: ' + (error.response?.data?.message || error.message));
            throw error; // 抛出错误让对话框处理loading状态
        }
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
                    <p className="text-gray-600 mt-1">管理系统注册用户、权限分配及账号状态</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">总用户数</span>
                    <p className="text-2xl font-bold text-[#8B4513]">{totalElements}</p>
                </div>
            </div>

            {/* 操作栏 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="搜索用户名、昵称..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-md"
                        />
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button onClick={() => loadUsers()} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        刷新
                    </Button>
                </div>
            </div>

            {/* 用户列表 */}
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">用户</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">角色</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">状态</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">注册时间</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#8B4513]">最后登录</th>
                                    <th className="px-5 py-4 text-right text-sm font-semibold text-[#8B4513]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            暂无用户数据
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Avatar className="h-9 w-9 mr-3">
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback className="bg-[#8B4513]/10 text-[#8B4513]">
                                                            {user.nickname?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.nickname || '未设置昵称'}</div>
                                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isAdmin ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        管理员
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <UserIcon className="w-3 h-3 mr-1" />
                                                        用户
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.enabled ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        正常
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        禁用
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/10"
                                                        title="修改权限"
                                                        onClick={() => handleEditRole(user)}
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={user.enabled
                                                            ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            : "text-green-500 hover:text-green-700 hover:bg-green-50"
                                                        }
                                                        title={user.enabled ? "禁用账号" : "启用账号"}
                                                        onClick={() => handleToggleStatus(user)}
                                                    >
                                                        {user.enabled ? (
                                                            <XCircle className="h-4 w-4" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="删除用户"
                                                        onClick={() => handleDelete(user)}
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
                            显示 {users.length} 条，共 {totalElements} 条
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

            <UserEditDialog
                open={editDialogOpen}
                user={selectedUser}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveRole}
            />
        </div>
    );
}
