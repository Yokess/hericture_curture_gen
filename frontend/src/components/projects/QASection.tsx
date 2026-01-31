import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Book, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/home/StatCard';
import { Boxes, MessageSquare } from 'lucide-react';

export function QASection() {
    return (
        <div className="p-6">
            {/* 知识库统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={Book}
                    value="1,247"
                    label="知识文档"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={Boxes}
                    value="45,892"
                    label="向量片段"
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    icon={MessageSquare}
                    value="8,563"
                    label="问答记录"
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
            </div>

            {/* 对话区域 */}
            <Card className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                <ScrollArea className="p-6 h-[500px]">
                    <div className="space-y-6">
                        {/* 欢迎消息 */}
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <Card className="bg-white rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="p-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            您好!我是智能非遗专家,基于专业的非遗知识库为您提供准确的解答。您可以向我提问关于非遗项目、传承人、技艺工序等任何问题。
                                        </p>
                                    </div>
                                </Card>
                                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                    <span>AI 助手</span>
                                </div>
                            </div>
                        </div>

                        {/* 用户问题 */}
                        <div className="flex items-start space-x-4 flex-row-reverse">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <Card className="bg-blue-50 rounded-2xl rounded-tr-none">
                                    <div className="p-4">
                                        <p className="text-gray-700">景德镇传统手工制瓷技艺有哪些主要工序?</p>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* AI 回答 */}
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <Card className="bg-white rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="p-4">
                                        <p className="text-gray-700 leading-relaxed mb-3">
                                            景德镇传统手工制瓷技艺包括 <strong>72 道工序</strong>,主要包括拉坯、利坯、画坯、施釉、烧窑等步骤。
                                        </p>

                                        {/* 知识源引用 */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Book className="w-4 h-4 text-[#8B4513]" />
                                                <span className="text-sm font-semibold text-[#8B4513]">知识来源</span>
                                            </div>
                                            <a
                                                href="/projects/1"
                                                className="block bg-[#F5F5DC] rounded-lg p-3 hover:bg-[#D4AF37]/10 transition-colors duration-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-sm font-semibold text-[#8B4513]">
                                                                景德镇传统手工制瓷技艺
                                                            </span>
                                                            <Badge className="bg-green-100 text-green-700 text-xs">项目</Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-600">官方编号: Ⅶ-023 • 2006(第一批)</p>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-[#8B4513] flex-shrink-0 ml-2" />
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                    <Badge className="bg-green-100 text-green-700">已验证</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* 输入区域 */}
                <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-end space-x-3">
                        <Textarea placeholder="请输入您的问题..." rows={2} className="resize-none" />
                        <Button className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg">
                            发送
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 常见问题 */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-bold text-[#8B4513] mb-4">常见问题</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        '景德镇瓷器的主要特点是什么?',
                        '苗族古歌的主要内容有哪些?',
                        '蔚县剪纸的特色是什么?',
                        '如何成为非遗传承人?',
                    ].map((question, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            className="justify-start text-left h-auto py-3 px-4 hover:bg-[#F5F5DC]"
                        >
                            <span className="text-[#8B4513]">{question}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
