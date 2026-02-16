import request from '@/utils/request';
import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = '/api/rag-chat';

// ========== 辅助函数 ==========

/**
 * 模拟打字机效果
 * 将大块文本分割成小块逐个发送，提供更好的用户体验
 */
const simulateTypingEffect = async (
    text: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
) => {
    const chunkSize = 5; // 每次显示5个字符
    const delay = 20; // 每次延迟20ms

    for (let i = 0; i < text.length; i += chunkSize) {
        if (signal?.aborted) break;

        const chunk = text.substring(i, i + chunkSize);
        onChunk(chunk);

        // 最后一块不需要延迟
        if (i + chunkSize < text.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// ========== 类型定义 ==========

export interface CreateSessionRequest {
    knowledgeBaseIds: number[];
    title?: string;
}

export interface SendMessageRequest {
    question: string;
}

export interface SessionDTO {
    id: number;
    title: string;
    knowledgeBaseIds: number[];
    createdAt: string;
}

export interface SessionListItemDTO {
    id: number;
    title: string;
    messageCount: number;
    knowledgeBaseNames: string[];
    updatedAt: string;
    isPinned: boolean;
}

export interface MessageDTO {
    id: number;
    type: 'user' | 'assistant';
    content: string;
    createdAt: string;
    // ✅ 新增：来源知识库ID列表（可选，因为 user 消息通常没有）
    sourceKnowledgeBaseIds?: number[];
}

export interface KnowledgeBaseListItemDTO {
    id: number;
    name: string;
    category: string | null;
    originalFilename: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    lastAccessedAt: string | null;
    accessCount: number;
    questionCount: number;
    vectorStatus: string;
    vectorError: string | null;
    chunkCount: number | null;
}

export interface SessionDetailDTO {
    id: number;
    title: string;
    knowledgeBases: KnowledgeBaseListItemDTO[];
    messages: MessageDTO[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateTitleRequest {
    title: string;
}

export interface UpdateKnowledgeBasesRequest {
    knowledgeBaseIds: number[];
}

// ========== API 方法 ==========

export const ragChatApi = {
    /**
     * 创建新会话
     */
    createSession: async (requestData: CreateSessionRequest): Promise<SessionDTO> => {
        const response = await request.post(`${BASE_URL}/sessions`, requestData);
        return response.data;
    },

    /**
     * 获取会话列表
     */
    listSessions: async (): Promise<SessionListItemDTO[]> => {
        const response = await request.get(`${BASE_URL}/sessions`);
        return response.data || [];
    },

    /**
     * 获取会话详情
     */
    getSessionDetail: async (sessionId: number): Promise<SessionDetailDTO> => {
        const response = await request.get(`${BASE_URL}/sessions/${sessionId}`);
        return response.data;
    },

    /**
     * 更新会话标题
     */
    updateTitle: async (sessionId: number, title: string): Promise<void> => {
        await request.put(`${BASE_URL}/sessions/${sessionId}/title`, { title });
    },

    /**
     * 切换置顶状态
     */
    togglePin: async (sessionId: number): Promise<void> => {
        await request.put(`${BASE_URL}/sessions/${sessionId}/pin`);
    },

    /**
     * 更新关联知识库
     */
    updateKnowledgeBases: async (sessionId: number, knowledgeBaseIds: number[]): Promise<void> => {
        await request.put(`${BASE_URL}/sessions/${sessionId}/knowledge-bases`, { knowledgeBaseIds });
    },

    /**
     * 删除会话
     */
    deleteSession: async (sessionId: number): Promise<void> => {
        await request.delete(`${BASE_URL}/sessions/${sessionId}`);
    },

    /**
     * 发送消息（流式SSE）
     * 使用 fetch API 接收流式响应
     *
     * @param sessionId 会话ID
     * @param question 问题
     * @param onChunk 接收到数据块时的回调
     * @param onComplete 流式完成时的回调
     * @param onError 错误时的回调
     * @returns AbortController 实例（可用于取消）
     */
    sendMessageStream: async (
        sessionId: number,
        question: string,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<AbortController> => {
        const url = `${import.meta.env.VITE_API_BASE_URL || ''}${BASE_URL}/sessions/${sessionId}/messages/stream`;
        const abortController = new AbortController();

        try {
            const token = tokenStorage.getToken();
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': token } : {}),
                },
                body: JSON.stringify({ question }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                // 如果是 401，清除 token 并跳转
                if (response.status === 401) {
                    tokenStorage.clear();
                    window.location.href = '/login';
                    throw new Error('登录已过期，请重新登录');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete();
                    break;
                }

                // 解码数据块
                buffer += decoder.decode(value, { stream: true });

                // 处理 SSE 格式：data: xxx\n\n
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一个不完整的行

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6); // 移除 "data: " 前缀
                        if (data.trim()) {
                            // 解析转义的换行符
                            const chunk = data.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

                            // 如果是大块内容（>100字符），模拟打字机效果
                            if (chunk.length > 100) {
                                simulateTypingEffect(chunk, onChunk, abortController.signal);
                            } else {
                                onChunk(chunk);
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                onError(error);
            }
        }

        return abortController;
    },
};

