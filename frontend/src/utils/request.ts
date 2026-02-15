import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';

/**
 * Axios 实例配置
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 120000, // 增加到 120 秒 (2分钟)，以适应 AI 图像生成
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 请求拦截器 - 自动添加 Token
 */
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 响应拦截器 - 统一处理错误
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // 如果后端返回的是统一格式 { code, message, data }
        const { code, message } = response.data;

        if (code === 200) {
            return response.data; // 返回整个响应对象
        }

        // 处理业务错误
        if (code === 401) {
            // Token 过期或未登录
            tokenStorage.clear();
            window.location.href = '/login';
            return Promise.reject(new Error(message || '请先登录'));
        }

        return Promise.reject(new Error(message || '请求失败'));
    },
    (error) => {
        // 网络错误或服务器错误
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                tokenStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

