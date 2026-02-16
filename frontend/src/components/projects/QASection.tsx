import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Bot, User, Book, Loader2, Send, Boxes, MessageSquare, Plus, ExternalLink, Search, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/home/StatCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ragChatApi, type MessageDTO, type SessionDetailDTO, type SessionListItemDTO } from '@/api/ragchat';
import { knowledgebaseApi } from '@/api/knowledgebase';

export function QASection() {
    const [sessions, setSessions] = useState<SessionListItemDTO[]>([]);
    const [currentSession, setCurrentSession] = useState<SessionDetailDTO | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [stats, setStats] = useState<{ totalCount: number; totalQuestionCount: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredSessionId, setHoveredSessionId] = useState<number | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // 加载统计信息和会话列表
    useEffect(() => {
        loadStats();
        loadSessions();
    }, []);

    const loadStats = async () => {
        try {
            const statsData = await knowledgebaseApi.getStatistics();
            setStats({
                totalCount: statsData.totalCount,
                totalQuestionCount: statsData.totalQuestionCount
            });
        } catch (error) {
            console.error('加载统计信息失败:', error);
        }
    };

    // 加载会话列表
    const loadSessions = async () => {
        try {
            const sessionList = await ragChatApi.listSessions();
            setSessions(sessionList);
        } catch (error) {
            console.error('加载会话列表失败:', error);
        }
    };

    // 创建新会话（使用所有已完成的知识库）
    const createNewSession = async () => {
        try {
            const kbList = await knowledgebaseApi.listKnowledgeBases();
            const completedKbs = kbList.filter(kb => kb.vectorStatus === 'COMPLETED');

            if (completedKbs.length === 0) {
                alert('暂无可用的知识库，请先上传并向量化知识库');
                return;
            }

            const session = await ragChatApi.createSession({
                knowledgeBaseIds: completedKbs.map(kb => kb.id),
                title: '非遗知识问答'
            });

            // 修复: createSession 返回的数据可能被封装在 data 属性中，或者结构不同
            // 后端返回的结构是 Result<SessionDTO>，前端 api 层可能直接返回了 data 部分
            // 假设 session 已经是 SessionDTO，直接取 id
            const sessionId = session.id || (session as any).data?.id;

            if (!sessionId) {
                throw new Error('创建会话返回数据异常，无法获取会话ID');
            }

            const detail = await ragChatApi.getSessionDetail(sessionId);
            setCurrentSession(detail);
            setMessages(detail.messages);
            loadSessions(); // 刷新会话列表
        } catch (error: any) {
            console.error('创建会话失败:', error);
            alert('创建会话失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 切换会话
    const switchSession = async (sessionId: number) => {
        try {
            const detail = await ragChatApi.getSessionDetail(sessionId);
            setCurrentSession(detail);
            setMessages(detail.messages);
        } catch (error: any) {
            console.error('加载会话失败:', error);
            alert('加载会话失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 删除会话
    const deleteSession = async (sessionId: number) => {
        if (!confirm('确定要删除这个会话吗？')) return;

        try {
            await ragChatApi.deleteSession(sessionId);
            loadSessions();

            // 如果删除的是当前会话，清空当前会话
            if (currentSession?.id === sessionId) {
                setCurrentSession(null);
                setMessages([]);
            }
        } catch (error: any) {
            console.error('删除会话失败:', error);
            alert('删除会话失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 开始编辑标题
    const startEditTitle = (sessionId: number, currentTitle: string) => {
        setEditingSessionId(sessionId);
        setEditingTitle(currentTitle);
    };

    // 保存标题
    const saveTitle = async (sessionId: number) => {
        if (!editingTitle.trim()) {
            setEditingSessionId(null);
            return;
        }

        try {
            await ragChatApi.updateTitle(sessionId, editingTitle.trim());
            setEditingSessionId(null);
            setEditingTitle('');
            await loadSessions();

            // 如果是当前会话，更新当前会话的标题
            if (currentSession?.id === sessionId) {
                setCurrentSession({ ...currentSession, title: editingTitle.trim() });
            }
        } catch (error: any) {
            console.error('更新标题失败:', error);
            alert('更新标题失败: ' + (error.response?.data?.message || error.message));
        }
    };

    // 取消编辑标题
    const cancelEditTitle = () => {
        setEditingSessionId(null);
        setEditingTitle('');
    };

    // 获取会话图标（根据知识库名称）
    const getSessionIcon = (session: SessionListItemDTO) => {
        const firstKbName = session.knowledgeBaseNames[0] || '';
        if (firstKbName.includes('瓷器') || firstKbName.includes('陶瓷')) return '🏺';
        if (firstKbName.includes('剪纸')) return '✂️';
        if (firstKbName.includes('古歌') || firstKbName.includes('音乐')) return '🎵';
        if (firstKbName.includes('刺绣')) return '🧵';
        return '📚';
    };

    // 时间分类辅助函数
    const getTimeCategory = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (date >= today) return '今天';
        if (date >= yesterday) return '昨天';
        if (date >= sevenDaysAgo) return '过去7天';
        return '更早';
    };

    // 过滤会话（根据搜索关键词）
    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 按时间分组会话
    const groupedSessions = filteredSessions.reduce((groups, session) => {
        const category = getTimeCategory(session.updatedAt);
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(session);
        return groups;
    }, {} as Record<string, SessionListItemDTO[]>);

    // 时间分类顺序
    const timeCategories = ['今天', '昨天', '过去7天', '更早'];

    // 初始化：如果没有会话，创建默认会话
    useEffect(() => {
        const initSession = async () => {
            const sessionList = await ragChatApi.listSessions();
            if (sessionList.length === 0) {
                await createNewSession();
            } else {
                // 加载第一个会话
                await switchSession(sessionList[0].id);
            }
        };
        initSession();
    }, []);

    // 自动滚动到底部
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, streamingContent]);

    // 发送消息
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentSession || isStreaming) return;

        const question = inputValue.trim();
        setInputValue('');
        setIsStreaming(true);
        setStreamingContent('');

        try {
            abortControllerRef.current = await ragChatApi.sendMessageStream(
                currentSession.id,
                question,
                (chunk) => {
                    setStreamingContent(prev => prev + chunk);
                },
                async () => {
                    // 流式完成，重新加载会话详情
                    setIsStreaming(false);
                    setStreamingContent('');
                    const detail = await ragChatApi.getSessionDetail(currentSession.id);
                    setMessages(detail.messages);
                    loadStats(); // 更新统计
                },
                (error) => {
                    setIsStreaming(false);
                    setStreamingContent('');
                    console.error('发送消息失败:', error);
                    alert('发送消息失败: ' + error.message);
                }
            );
        } catch (error: any) {
            setIsStreaming(false);
            setStreamingContent('');
            console.error('发送消息失败:', error);
            alert('发送消息失败: ' + error.message);
        }
    };

    // 处理快捷问题
    const handleQuickQuestion = (question: string) => {
        setInputValue(question);
    };

    // 渲染消息
    const renderMessage = (message: MessageDTO) => {
        const isUser = message.type === 'user';

        // 1. 获取该条消息实际引用的知识库 ID 列表 (后端返回的字段)
        // 如果字段不存在(旧数据)或为空，给一个空数组
        const sourceIds = message.sourceKnowledgeBaseIds || [];

        // 2. 根据 ID 从会话的全量知识库中筛选出具体的知识库对象
        const relatedKbs = currentSession?.knowledgeBases.filter(kb =>
            sourceIds.includes(kb.id)
        ) || [];

        return (
            <div key={message.id} className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-[#8B4513] to-[#D4AF37]'
                }`}>
                    {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                    <Card className={`rounded-2xl ${
                        isUser
                            ? 'bg-blue-50 rounded-tr-none'
                            : 'bg-white rounded-tl-none shadow-sm'
                    }`}>
                        <div className="p-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{message.content}</p>

                            {/* AI回答显示知识来源 */}
                            {/* 修正判定条件：!isUser (是AI) 且 relatedKbs 有值时才显示 */}
                            {!isUser && relatedKbs.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Book className="w-4 h-4 text-[#8B4513]" />
                                        <span className="text-sm font-semibold text-[#8B4513]">知识来源</span>
                                    </div>
                                    <div className="space-y-2">
                                        {/* 这里遍历 relatedKbs (实际引用) 而不是 currentSession.knowledgeBases */}
                                        {relatedKbs.map((kb) => (
                                            <div
                                                key={kb.id}
                                                className="block bg-[#F5F5DC] rounded-lg p-3 hover:bg-[#D4AF37]/10 transition-colors duration-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-sm font-semibold text-[#8B4513]">
                                                                {kb.name}
                                                            </span>
                                                            {kb.category && (
                                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                                    {kb.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600">
                                                            {kb.originalFilename} • {(kb.fileSize / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-[#8B4513] flex-shrink-0 ml-2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* 知识库统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={Book}
                    value={stats ? stats.totalCount.toString() : '0'}
                    label="知识文档"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={Boxes}
                    value="--"
                    label="向量片段"
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    icon={MessageSquare}
                    value={stats ? stats.totalQuestionCount.toString() : '0'}
                    label="问答记录"
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
            </div>

            {/* 主要内容区域：侧边栏 + 对话区域 */}
            <div className="flex gap-6">
                {/* 会话列表侧边栏 - 简化版 */}
                <Card className="w-64 flex-shrink-0 bg-[#F5F5DC] rounded-2xl overflow-hidden border-none shadow-sm">
                    {/* 头部 */}
                    <div className="p-4 border-b border-[#D4AF37]/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-serif text-base font-bold text-[#8B4513]">智能非遗专家</h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-[#8B4513] hover:bg-[#D4AF37]/20"
                            >
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* 搜索框 */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="搜索会话"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white border-[#D4AF37]/30 text-sm h-9"
                            />
                        </div>

                        {/* 新建会话按钮 */}
                        <Button
                            className="w-full mt-3 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-md text-white font-medium h-9"
                            onClick={createNewSession}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            新会话
                        </Button>
                    </div>

                    {/* 会话列表 */}
                    <div className="h-[550px] overflow-y-auto">
                        {filteredSessions.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Bot className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">{searchQuery ? '未找到相关会话' : '暂无会话'}</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {timeCategories.map((category) => {
                                    const categorySessions = groupedSessions[category];
                                    if (!categorySessions || categorySessions.length === 0) return null;

                                    return (
                                        <div key={category} className="mb-3">
                                            <div className="px-2 py-1 text-xs font-medium text-gray-500">
                                                {category}
                                            </div>
                                            <div className="space-y-1">
                                                {categorySessions.map((session) => (
                                                    <div
                                                        key={session.id}
                                                        className={`group px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                                                            currentSession?.id === session.id
                                                                ? 'bg-white shadow-sm border border-[#D4AF37]/30'
                                                                : 'hover:bg-white/50'
                                                        }`}
                                                        onMouseEnter={() => setHoveredSessionId(session.id)}
                                                        onMouseLeave={() => setHoveredSessionId(null)}
                                                        onClick={() => {
                                                            if (editingSessionId !== session.id) {
                                                                switchSession(session.id);
                                                            }
                                                        }}
                                                    >
                                                        {editingSessionId === session.id ? (
                                                            // 编辑模式
                                                            <>
                                                                <span className="text-lg flex-shrink-0">{getSessionIcon(session)}</span>
                                                                <input
                                                                    type="text"
                                                                    value={editingTitle}
                                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            saveTitle(session.id);
                                                                        } else if (e.key === 'Escape') {
                                                                            cancelEditTitle();
                                                                        }
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex-1 px-2 py-1 text-sm border border-[#D4AF37] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                                                    autoFocus
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 hover:bg-green-100"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        saveTitle(session.id);
                                                                    }}
                                                                >
                                                                    <span className="text-green-600">✓</span>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        cancelEditTitle();
                                                                    }}
                                                                >
                                                                    <span className="text-red-600">✕</span>
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            // 正常显示模式
                                                            <>
                                                                <span className="text-lg flex-shrink-0">{getSessionIcon(session)}</span>
                                                                <span className={`text-sm truncate flex-1 ${
                                                                    currentSession?.id === session.id
                                                                        ? 'text-[#8B4513] font-medium'
                                                                        : 'text-gray-700'
                                                                }`}>
                                                                    {session.title}
                                                                </span>
                                                                {session.isPinned && (
                                                                    <span className="text-[#D4AF37] text-xs">★</span>
                                                                )}

                                                                {/* 悬停时显示的操作按钮 */}
                                                                {hoveredSessionId === session.id && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0 hover:bg-[#D4AF37]/20"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                startEditTitle(session.id, session.title);
                                                                            }}
                                                                        >
                                                                            <Edit3 className="w-3 h-3 text-[#8B4513]" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0 hover:bg-red-100"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteSession(session.id);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 对话区域 */}
                <Card className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                <div className="p-6 h-[500px] overflow-y-auto" ref={scrollContainerRef}>
                    <div className="space-y-6">
                        {/* 欢迎消息 + 常见问题 */}
                        {messages.length === 0 && !isStreaming && (
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <Card className="bg-white rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="p-4">
                                            <p className="text-gray-700 leading-relaxed mb-4">
                                                您好!我是智能非遗专家,基于专业的非遗知识库为您提供准确的解答。您可以向我提问关于非遗项目、传承人、技艺工序等任何问题。
                                            </p>

                                            {/* 常见问题 */}
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <MessageSquare className="w-4 h-4 text-[#8B4513]" />
                                                    <span className="text-sm font-semibold text-[#8B4513]">常见问题</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        '景德镇瓷器的主要特点是什么?',
                                                        '苗族古歌的主要内容有哪些?',
                                                        '蔚县剪纸的特色是什么?',
                                                        '如何成为非遗传承人?',
                                                    ].map((question, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="outline"
                                                            size="sm"
                                                            className="justify-start text-left h-auto py-2 px-3 hover:bg-[#F5F5DC] border-[#D4AF37]/30"
                                                            onClick={() => handleQuickQuestion(question)}
                                                        >
                                                            <span className="text-sm text-[#8B4513]">{question}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                        <span>AI 助手</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 历史消息 */}
                        {messages.map(renderMessage)}

                        {/* 流式响应中的消息 */}
                        {isStreaming && streamingContent && (
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <Card className="bg-white rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="p-4">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{streamingContent}</p>
                                            <div className="mt-2 flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 输入区域 */}
                <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-end space-x-3">
                        <Textarea
                            placeholder="请输入您的问题..."
                            rows={2}
                            className="resize-none"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            disabled={isStreaming || !currentSession}
                        />
                        <Button
                            className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                            onClick={handleSendMessage}
                            disabled={isStreaming || !currentSession || !inputValue.trim()}
                        >
                            {isStreaming ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
            </div>
        </div>
    );
}
