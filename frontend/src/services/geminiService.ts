import { designApi } from '@/api/design';
import { DesignProject } from '@/types/design';

// 1. 仅生成概念 (Concept)
export const generateConceptOnly = async (
    idea: string,
    chatHistory: Array<{ role: string; content: string }> = []
): Promise<DesignProject> => {
    try {
        const response = await designApi.generateConcept({ 
            idea,
            useRag: true,
            chatHistory
        });

        // 调试日志
        console.log('generateConcept Response:', response);

        // response 已经是后端返回的完整对象: { code: 200, message: "success", data: {...} }
        // 这里的 data 才是真正的 DesignProject 对象
        const projectData = (response as any).data; 

        if (!projectData || !projectData.concept) {
             console.error('Data Structure Error:', projectData);
             throw new Error('后端返回数据缺失 concept 字段');
        }

        return {
            ...projectData.concept,
            id: projectData.id,
            blueprintUrl: projectData.blueprintUrl,
            productShotUrl: projectData.productShotUrl
        };
    } catch (error) {
        console.error('AI 概念生成失败:', error);
        throw error;
    }
};

// 2. 生成草图 (Blueprint)
export const generateBlueprint = async (concept: any): Promise<string> => {
    try {
        const response = await designApi.generateBlueprint({ concept });
        // response: { code: 200, message: "success", data: "https://..." }
        // 所以真正的 URL 是 (response as any).data
        return (response as any).data;
    } catch (error) {
        console.error('AI 草图生成失败:', error);
        throw error;
    }
};

// 3. 生成效果图 (Render) - 支持基于草图生成
export const generateRender = async (concept: any, blueprintUrl?: string): Promise<string> => {
    try {
        const response = await designApi.generateRender({ concept, blueprintUrl });
        // response: { code: 200, message: "success", data: "https://..." }
        return (response as any).data;
    } catch (error) {
        console.error('AI 效果图生成失败:', error);
        throw error;
    }
};

// 保留旧方法兼容性，但在内部将其拆分为分步调用（可选）
export const translateToDesignConcept = async (idea: string): Promise<Omit<DesignProject, 'id'>> => {
    // ... 旧逻辑保持不变，用于旧组件兼容 ...
    try {
        const response = await designApi.generateDesign({ 
            idea,
            useRag: true,
            generateImage: true 
        });
        
        const { concept, blueprintUrl, productShotUrl } = response.data as any;
        
        return {
            ...concept,
            blueprintUrl,
            productShotUrl
        };
    } catch (error) {
        console.error('AI 设计生成失败:', error);
        throw error;
    }
};

// 兼容旧代码，实际上 translateToDesignConcept 已经包含了图片生成
// 这个函数可以保留用于单独重新生成图片（如果后端支持的话）
export const generateOrEditImage = async (
    prompt: string,
    base64Data?: string,
    mimeType?: string
): Promise<string> => {
    // 暂时仍返回 Mock 图片，因为后端 generateDesign 已经一次性返回了图片
    // 如果需要单独生成图片，需要在后端添加单独的 image generation 接口
    console.warn('generateOrEditImage 目前仅作为占位符，实际图片由 translateToDesignConcept 返回');
    
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#f5f4ed"/>
        <text x="400" y="300" font-family="serif" font-size="24" fill="#8B4513" text-anchor="middle">
          请使用"生成工业设计提案"按钮获取完整方案
        </text>
      </svg>
    `);
};
