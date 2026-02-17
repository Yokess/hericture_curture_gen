import axiosInstance from '@/utils/request';
import { DesignProject } from '@/types/design';
import { tokenStorage } from '@/utils/tokenStorage';

export const designApi = {
    generateConcept: (data: { idea: string; useRag?: boolean; chatHistory?: Array<{ role: string; content: string }> }) => {
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

    saveDesign: (data: { userId: number; project: DesignProject; userIdea: string; chatHistory?: Array<{ role: string; content: string }> }) => {
        return axiosInstance.post<any, { data: any }>('/api/design/save', data);
    },

    getMyDesigns: () => {
        return axiosInstance.get<any, { data: DesignProject[] }>('/api/design/list');
    },

    getDesignById: (id: number) => {
        return axiosInstance.get<any, { data: DesignProject }>(`/api/design/${id}`);
    },

    publishDesign: (id: number) => {
        return axiosInstance.post<any, { data: any }>(`/api/design/${id}/publish`);
    },

    deleteDesign: (id: number) => {
        return axiosInstance.delete<any, { data: void }>(`/api/design/${id}`);
    },

    getPublishedDesigns: () => {
        return axiosInstance.get<any, { data: DesignProject[] }>('/api/design/public');
    },

    exportPdf: (id: number) => {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const token = tokenStorage.getToken();
        const url = `${baseURL}/api/design/${id}/export-pdf`;
        
        return fetch(url, {
            headers: {
                'Authorization': token || '',
            }
        }).then(res => res.blob());
    },

    generateAnalysis: (data: { concept: any }) => {
        return axiosInstance.post<any, { data: any }>('/api/design/generate/analysis', data);
    },

    saveAnalysis: (id: number, analysis: any) => {
        return axiosInstance.post<any, { data: any }>(`/api/design/${id}/analysis`, analysis);
    }
};
