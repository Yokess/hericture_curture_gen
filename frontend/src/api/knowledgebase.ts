import request from '@/utils/request';

// 知识库项接口
export interface KnowledgeBaseItem {
    id: number;
    name: string;
    category: string;
    originalFilename: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    accessCount: number;
    questionCount: number;
    vectorStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    vectorError?: string;
    chunkCount?: number;  // 分块数量
}

// 统计信息接口
export interface KnowledgeBaseStats {
    totalCount: number;
    totalQuestionCount: number;
    totalAccessCount: number;
    completedCount: number;
    processingCount: number;
}

// API 基础路径
const BASE_URL = '/api/knowledgebase';

export const knowledgebaseApi = {
    // 获取知识库列表（支持排序）
    listKnowledgeBases: async (sortBy?: string): Promise<KnowledgeBaseItem[]> => {
        const response = await request.get(`${BASE_URL}/list`, {
            params: sortBy ? { sortBy } : {}
        });
        // 适配后端返回的 Result 结构 (request 拦截器已经解包了 Result.data, 但这里后端可能返回了 data: {data: []})
        // 假设 request 拦截器返回的是 response.data
        return response.data || [];
    },

    // 获取知识库详情
    getKnowledgeBase: async (id: number): Promise<KnowledgeBaseItem> => {
        const response = await request.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // 搜索知识库
    searchKnowledgeBases: async (keyword: string): Promise<KnowledgeBaseItem[]> => {
        const response = await request.get(`${BASE_URL}/search`, {
            params: { keyword }
        });
        return response.data || [];
    },

    // 获取统计信息
    getStatistics: async (): Promise<KnowledgeBaseStats> => {
        const response = await request.get(`${BASE_URL}/stats`);
        return response.data || {
            totalCount: 0,
            vectorizedCount: 0,
            totalQuestions: 0,
            categoryCount: 0
        };
    },

    // 上传知识库
    uploadKnowledgeBase: async (formData: FormData): Promise<any> => {
        const response = await request.post(`${BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response; // 已经是 data
    },

    // 删除知识库
    deleteKnowledgeBase: async (id: number): Promise<void> => {
        await request.delete(`${BASE_URL}/${id}`);
    },

    // 下载知识库
    downloadKnowledgeBase: async (id: number): Promise<Blob> => {
        const response = await request.get(`${BASE_URL}/${id}/download`, {
            responseType: 'blob'
        });
        return response as any as Blob;
    },

    // 重新向量化
    revectorize: async (id: number): Promise<void> => {
        await request.post(`${BASE_URL}/${id}/revectorize`);
    },

    // ========== 分类管理 API ==========

    // 获取所有分类
    getAllCategories: async (): Promise<string[]> => {
        const response = await request.get(`${BASE_URL}/categories`);
        return response.data || [];
    },

    // 根据分类获取知识库列表
    getByCategory: async (category: string): Promise<KnowledgeBaseItem[]> => {
        const response = await request.get(`${BASE_URL}/category/${encodeURIComponent(category)}`);
        return response.data || [];
    },

    // 获取未分类的知识库
    getUncategorized: async (): Promise<KnowledgeBaseItem[]> => {
        const response = await request.get(`${BASE_URL}/uncategorized`);
        return response.data || [];
    },

    // 更新知识库分类
    updateCategory: async (id: number, category: string | null): Promise<void> => {
        await request.put(`${BASE_URL}/${id}/category`, { category });
    }
};
