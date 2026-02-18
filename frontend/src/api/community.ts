import axiosInstance from '@/utils/request';

export interface CommunityPostListItemDTO {
  id: number;
  userId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  artifactId: number;
  projectId?: number | null;
  title: string;
  contentPreview?: string | null;
  tags?: string[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  coverUrl?: string | null;
  createdAt: string;
}

export interface CommunityPostDetailDTO {
  id: number;
  userId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  artifactId: number;
  projectId?: number | null;
  title: string;
  content?: string | null;
  tags?: string[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  liked?: boolean;
  collected?: boolean;
  remixPrompt?: string | null;
  createdAt: string;
  artifact?: {
    id: number;
    designName?: string | null;
    designConcept?: string | null;
    blueprintUrl?: string | null;
    productShotUrl?: string | null;
    kvUrl?: string | null;
    lifestyleUrl?: string | null;
    detailUrl?: string | null;
  } | null;
}

export interface CommunityCommentDTO {
  id: number;
  postId: number;
  userId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  parentId?: number | null;
  createdAt: string;
  replies?: CommunityCommentDTO[];
}

export interface PageDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface InteractionResultDTO {
  active: boolean;
  likeCount?: number;
}

export const communityApi = {
  listPosts: (params: { projectId?: number; tag?: string; sort?: 'latest' | 'popular' | 'likes'; page?: number; size?: number }) => {
    return axiosInstance.get<any, { data: PageDTO<CommunityPostListItemDTO> }>('/api/community/posts', { params });
  },
  getPost: (id: number) => {
    return axiosInstance.get<any, { data: CommunityPostDetailDTO }>(`/api/community/posts/${id}`);
  },
  createPost: (data: { artifactId: number; projectId?: number; title?: string; content?: string; tags?: string[] }) => {
    return axiosInstance.post<any, { data: any }>('/api/community/posts', data);
  },
  toggleLike: (id: number) => {
    return axiosInstance.post<any, { data: InteractionResultDTO }>(`/api/community/posts/${id}/like`);
  },
  toggleCollect: (id: number) => {
    return axiosInstance.post<any, { data: InteractionResultDTO }>(`/api/community/posts/${id}/collect`);
  },
  listComments: (id: number) => {
    return axiosInstance.get<any, { data: CommunityCommentDTO[] }>(`/api/community/posts/${id}/comments`);
  },
  addComment: (id: number, data: { content: string; parentId?: number }) => {
    return axiosInstance.post<any, { data: CommunityCommentDTO }>(`/api/community/posts/${id}/comments`, data);
  },

  adminPinPost: (id: number, pinned: boolean) => {
    return axiosInstance.post<any, { data: void }>(`/api/admin/community/posts/${id}/pin`, undefined, { params: { pinned } });
  },
  adminDeletePost: (id: number) => {
    return axiosInstance.delete<any, { data: void }>(`/api/admin/community/posts/${id}`);
  },
};
