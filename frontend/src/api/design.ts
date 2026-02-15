import axiosInstance from '@/utils/request';
import { DesignProject } from '@/types/design';

export const designApi = {
    /**
     * 第一步：生成设计概念
     */
    generateConcept: (data: { idea: string; useRag?: boolean }) => {
        return axiosInstance.post<any, { data: DesignProject }>('/api/design/generate/concept', data);
    },

    /**
     * 第二步：生成草图
     */
    generateBlueprint: (data: { concept: any }) => {
        return axiosInstance.post<any, { data: string }>('/api/design/generate/blueprint', data);
    },

    /**
     * 第三步：生成效果图 (支持图生图)
     */
    generateRender: (data: { concept: any; blueprintUrl?: string }) => {
        return axiosInstance.post<any, { data: string }>('/api/design/generate/render', data);
    },

    /**
     * 一键生成 (Legacy)
     */
    generateDesign: (data: { idea: string; useRag?: boolean; generateImage?: boolean }) => {
        return axiosInstance.post<any, { data: DesignProject }>('/api/design/generate', data);
    }
};
