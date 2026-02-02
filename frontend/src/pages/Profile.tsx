import { useState, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import {
    User,
    Mail,
    Phone,
    Camera,
    Save,
    Lock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function Profile() {
    const { user, refetchUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 个人信息表单
    const [profileForm, setProfileForm] = useState({
        nickname: user?.nickname || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // 密码修改表单
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // 获取头像占位符
    const getAvatarFallback = () => {
        if (user?.nickname) {
            return user.nickname.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // 处理头像上传
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: '请上传图片文件' });
            return;
        }

        // 验证文件大小 (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: '图片大小不能超过 2MB' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            // 上传头像到服务器
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/files/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': authApi.getToken() || '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('头像上传失败');
            }

            const result = await response.json();

            // 检查响应格式
            if (result.code === 200 && result.data) {
                // 更新用户头像 URL
                await authApi.updateProfile({
                    avatarUrl: result.data.storageUrl,
                });

                setMessage({ type: 'success', text: '头像上传成功' });
                await refetchUser();
            } else {
                throw new Error(result.message || '头像上传失败');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '头像上传失败' });
        } finally {
            setIsLoading(false);
        }
    };

    // 更新个人信息
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await authApi.updateProfile({
                nickname: profileForm.nickname,
                email: profileForm.email,
                phone: profileForm.phone,
            });

            setMessage({ type: 'success', text: '个人信息更新成功' });
            await refetchUser();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '更新失败' });
        } finally {
            setIsLoading(false);
        }
    };

    // 修改密码
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // 验证新密码
        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: '新密码长度至少为 6 个字符' });
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的密码不一致' });
            return;
        }

        setIsLoading(true);

        try {
            await authApi.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });

            setMessage({ type: 'success', text: '密码修改成功' });
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '密码修改失败' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F5F5DC]">
                <Navbar />
                <div className="pt-32 pb-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-gray-600">请先登录</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
            />

            {/* 页面标题 */}
            <section className="pt-32 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">
                        个人中心
                    </h1>
                    <p className="text-xl text-gray-600">
                        管理您的个人信息和账户设置
                    </p>
                </div>
            </section>

            {/* 主内容区 */}
            <section className="pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* 消息提示 */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 左侧 - 用户卡片 */}
                        <Card className="lg:col-span-1 p-6">
                            <div className="flex flex-col items-center">
                                {/* 头像 */}
                                <div className="relative group">
                                    <Avatar className="w-32 h-32">
                                        <AvatarImage src={user.avatarUrl} alt={user.nickname || user.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#8B4513] to-[#D4AF37] text-white text-4xl">
                                            {getAvatarFallback()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={handleAvatarClick}
                                        disabled={isLoading}
                                        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                                    >
                                        <Camera className="w-8 h-8 text-white" />
                                    </button>
                                </div>

                                {/* 用户信息 */}
                                <h2 className="mt-4 font-serif text-2xl font-bold text-[#8B4513]">
                                    {user.nickname || user.username}
                                </h2>
                                <p className="text-gray-600">@{user.username}</p>

                                {user.isAdmin && (
                                    <span className="mt-2 px-3 py-1 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white text-xs rounded-full">
                                        管理员
                                    </span>
                                )}

                                {/* 统计信息 */}
                                <div className="mt-6 w-full space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">作品数量</span>
                                        <span className="font-semibold text-[#8B4513]">0</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">收藏数量</span>
                                        <span className="font-semibold text-[#8B4513]">0</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">点赞数量</span>
                                        <span className="font-semibold text-[#8B4513]">0</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 右侧 - 设置标签页 */}
                        <Card className="lg:col-span-2 p-6">
                            <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="profile">个人信息</TabsTrigger>
                                    <TabsTrigger value="security">安全设置</TabsTrigger>
                                </TabsList>

                                {/* 个人信息标签 */}
                                <TabsContent value="profile">
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">用户名</Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={user.username}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500">用户名不可修改</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nickname">昵称</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="nickname"
                                                    type="text"
                                                    placeholder="请输入昵称"
                                                    value={profileForm.nickname}
                                                    onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">邮箱</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="请输入邮箱"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">手机号</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="请输入手机号"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    保存中...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    保存修改
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* 安全设置标签 */}
                                <TabsContent value="security">
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="old-password">当前密码</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="old-password"
                                                    type="password"
                                                    placeholder="请输入当前密码"
                                                    value={passwordForm.oldPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">新密码</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    placeholder="至少6个字符"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    className="pl-10"
                                                    minLength={6}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">确认新密码</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    placeholder="再次输入新密码"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    修改中...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    修改密码
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
