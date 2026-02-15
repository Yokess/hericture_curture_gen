import axiosInstance from '@/utils/request';
import { DesignProject } from '@/types/design';

export const designApi = {
    generateConcept: (data: { idea: string; useRag?: boolean }) => {
        return axiosInstance.post<any, { data: DesignProject }>('/api/design/generate/concept', data);
    },

    generateBlueprint: (data: { concept: any }) => {
        return axiosInstance.post<any, { data: string }>('/api/design/generate/blueprint', data);
    },

    generateRender: (data: { concept: any; blueprintUrl?: string }) => {
        return axiosInstance.post<any, { data: string }>('/api/design/generate/render', data);
    },

    generateDesign: (data: { idea: string; useRag?: boolean; generateImage?: boolean }) => {
        return axiosInstance.post<any, { data: DesignProject }>('/api/design/generate', data);
    },

    saveDesign: (data: { userId: number; project: DesignProject; userIdea: string }) => {
        return axiosInstance.post<any, { data: any }>('/api/design/save', data);
    },

    getUserDesigns: (userId: number) => {
        return axiosInstance.get<any, { data: DesignProject[] }>(`/api/design/user/${userId}`);
    },

    getDesignById: (id: number) => {
        return axiosInstance.get<any, { data: DesignProject }>(`/api/design/${id}`);
    },

    publishDesign: (id: number, userId: number) => {
        return axiosInstance.post<any, { data: any }>(`/api/design/${id}/publish?userId=${userId}`, {});
    },

    deleteDesign: (id: number, userId: number) => {
        return axiosInstance.delete<any, { data: void }>(`/api/design/${id}?userId=${userId}`);
    },

    getPublishedDesigns: () => {
        return axiosInstance.get<any, { data: DesignProject[] }>('/api/design/public');
    }
};
