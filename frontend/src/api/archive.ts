import request from '@/utils/request';

// ==================== 类型定义 ====================

export interface ProcessStepDto {
    id: number;
    stepOrder: number;
    stepName: string;
    description: string;
    keyframeUrl: string | null;
    startTimeMs: number | null;
    endTimeMs: number | null;
}

export interface VideoStatusResponse {
    projectId: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    errorMsg?: string | null;
    videoUrl?: string | null;
    originalFilename?: string | null;
    steps?: ProcessStepDto[] | null;
}

export interface VideoUploadResponse {
    projectId: number;
}

// ==================== 技艺数字化档案 API ====================

const BASE_URL = '/api/archive';

export const archiveApi = {
    /**
     * 上传视频
     */
    uploadVideo: async (file: File): Promise<VideoUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await request.post<{ data: VideoUploadResponse }>(
            `${BASE_URL}/video/upload`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000, // 5 分钟
            }
        );
        return response.data;
    },

    /**
     * 查询视频处理状态
     */
    getStatus: async (projectId: number): Promise<VideoStatusResponse> => {
        const response = await request.get<{ data: VideoStatusResponse }>(
            `${BASE_URL}/video/${projectId}/status`
        );
        return response.data;
    },

    /**
     * 获取工序详情（与 status 合并，返回完整数据）
     */
    getProcessSteps: async (projectId: number): Promise<VideoStatusResponse> => {
        const response = await request.get<{ data: VideoStatusResponse }>(
            `${BASE_URL}/video/${projectId}/steps`
        );
        return response.data;
    },

    /**
     * 获取当前用户的视频档案列表
     */
    listMyVideos: async (): Promise<VideoStatusResponse[]> => {
        const response = await request.get<{ data: VideoStatusResponse[] }>(
            `${BASE_URL}/videos`
        );
        return response.data || [];
    },
};
