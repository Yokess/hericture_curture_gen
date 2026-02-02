import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layers, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 登录表单
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });

    // 注册表单
    const [registerForm, setRegisterForm] = useState({
        username: '',
        password: '',
        email: '',
        nickname: ''
    });

    // 处理登录
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await login(loginForm);
            // 登录成功,跳转到首页
            navigate('/');
        } catch (err: any) {
            setError(err.message || '登录失败,请检查用户名和密码');
        } finally {
            setIsLoading(false);
        }
    };

    // 处理注册
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await register(registerForm);
            setSuccessMessage('注册成功！请切换到登录标签页进行登录');
            // 清空注册表单
            setRegisterForm({
                username: '',
                password: '',
                email: '',
                nickname: ''
            });
        } catch (err: any) {
            setError(err.message || '注册失败,请重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#D4AF37]/20 flex items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-[#8B4513]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
            </div>

            {/* 登录卡片 */}
            <Card className="w-full max-w-md relative z-10 shadow-2xl border-[#D4AF37]/20">
                <div className="p-8">
                    {/* Logo 和标题 */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-2xl mb-4">
                            <Layers className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-[#8B4513] mb-2">
                            非遗文化平台
                        </h1>
                        <p className="text-gray-600">传承中华文化,创新设计未来</p>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* 成功提示 */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-800">{successMessage}</p>
                        </div>
                    )}

                    {/* 登录/注册标签 */}
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login" onClick={() => setError(null)}>登录</TabsTrigger>
                            <TabsTrigger value="register" onClick={() => setError(null)}>注册</TabsTrigger>
                        </TabsList>

                        {/* 登录表单 */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username">用户名</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="login-username"
                                            type="text"
                                            placeholder="请输入用户名"
                                            value={loginForm.username}
                                            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">密码</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="请输入密码"
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                        <span className="text-gray-600">记住我</span>
                                    </label>
                                    <a href="#" className="text-[#8B4513] hover:text-[#D4AF37]">
                                        忘记密码?
                                    </a>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            登录中...
                                        </>
                                    ) : (
                                        <>
                                            登录
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* 注册表单 */}
                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-username">用户名 *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="register-username"
                                            type="text"
                                            placeholder="3-50个字符"
                                            value={registerForm.username}
                                            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                                            className="pl-10"
                                            minLength={3}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">邮箱</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={registerForm.email}
                                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-nickname">昵称</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="register-nickname"
                                            type="text"
                                            placeholder="显示名称(可选)"
                                            value={registerForm.nickname}
                                            onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">密码 *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="至少6个字符"
                                            value={registerForm.password}
                                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                            className="pl-10"
                                            minLength={6}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    注册即表示您同意我们的
                                    <a href="#" className="text-[#8B4513] hover:text-[#D4AF37]"> 服务条款 </a>
                                    和
                                    <a href="#" className="text-[#8B4513] hover:text-[#D4AF37]"> 隐私政策</a>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            注册中...
                                        </>
                                    ) : (
                                        <>
                                            注册
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* 返回首页 */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 hover:text-[#8B4513] transition-colors"
                        >
                            ← 返回首页
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
