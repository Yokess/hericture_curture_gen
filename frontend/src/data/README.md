# 模拟数据与类型定义使用指南

## 📁 文件结构

```
frontend/src/
├── types/
│   └── index.ts          # TypeScript 类型定义
└── data/
    └── mockData.ts       # 模拟数据
```

## 🎯 类型定义概览

### 用户系统

- `User` - 用户基本信息
- `UserAchievement` - 用户成就/勋章
- `UserWithStats` - 带统计信息的用户

### 非遗项目

- `HeritageProject` - 非遗项目
- `HeritageSuccessor` - 传承人
- `ProjectWithSuccessors` - 带传承人的项目

### RAG 知识库

- `KnowledgeChunk` - 知识向量切片

### AI 设计生成

- `CreativeSession` - 创作会话
- `DesignArtifact` - 设计产物

### 视频档案

- `Video` - 视频信息
- `ProcessStep` - 工艺步骤
- `VideoWithSteps` - 带步骤的视频

### 社区

- `CommunityPost` - 社区帖子
- `Comment` - 评论
- `Interaction` - 互动(点赞/收藏)
- `PostWithDetails` - 带完整信息的帖子

## 📊 模拟数据说明

### 基础数据

- `mockUsers` - 3个用户
- `mockAchievements` - 3个成就
- `mockProjects` - 4个非遗项目(苗族古歌、景德镇瓷器、蔚县剪纸、侗族大歌)
- `mockSuccessors` - 3个传承人
- `mockArtifacts` - 3个设计作品
- `mockVideos` - 3个视频
- `mockProcessSteps` - 6个工艺步骤
- `mockPosts` - 3个社区帖子
- `mockComments` - 5条评论

### 组合数据

- `mockUsersWithStats` - 带统计的用户
- `mockProjectsWithSuccessors` - 带传承人的项目
- `mockVideosWithSteps` - 带步骤的视频
- `mockPostsWithDetails` - 带完整信息的帖子

## 💡 使用示例

### 1. 在组件中导入类型

```tsx
import type { User, HeritageProject, DesignArtifact } from '@/types';

interface ProjectCardProps {
  project: HeritageProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div>
      <h3>{project.name}</h3>
      <p>{project.category}</p>
      <p>{project.location}</p>
    </div>
  );
}
```

### 2. 使用模拟数据

```tsx
import { mockProjects, mockPostsWithDetails } from '@/data/mockData';

export function ProjectList() {
  return (
    <div>
      {mockProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### 3. 在 API 层使用

```tsx
// src/api/projects.ts
import type { HeritageProject, ProjectWithSuccessors } from '@/types';
import { mockProjectsWithSuccessors } from '@/data/mockData';

export async function getProjects(): Promise<HeritageProject[]> {
  // 开发阶段返回模拟数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProjectsWithSuccessors), 500);
  });
}

export async function getProjectById(id: number): Promise<ProjectWithSuccessors | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjectsWithSuccessors.find((p) => p.id === id);
      resolve(project || null);
    }, 300);
  });
}
```

### 4. 状态管理示例

```tsx
import { useState, useEffect } from 'react';
import type { PostWithDetails } from '@/types';
import { mockPostsWithDetails } from '@/data/mockData';

export function CommunityPage() {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟 API 调用
    setTimeout(() => {
      setPosts(mockPostsWithDetails);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>作者: {post.user.nickname}</p>
          <p>👍 {post.likeCount} 👁️ {post.viewCount}</p>
          <div>
            {post.comments.map((comment) => (
              <div key={comment.id}>{comment.content}</div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
```

### 5. 视频档案展示

```tsx
import type { VideoWithSteps } from '@/types';
import { mockVideosWithSteps } from '@/data/mockData';

export function VideoArchive() {
  return (
    <div>
      {mockVideosWithSteps.map((video) => (
        <div key={video.id}>
          <h3>{video.originalFilename}</h3>
          <p>项目: {video.project?.name}</p>
          <p>状态: {video.analysisStatus}</p>
          
          {video.steps.length > 0 && (
            <div>
              <h4>工艺步骤:</h4>
              {video.steps.map((step) => (
                <div key={step.id}>
                  <strong>{step.stepOrder}. {step.stepName}</strong>
                  <p>{step.description}</p>
                  <p>时间: {step.startTimeMs / 1000}s - {step.endTimeMs / 1000}s</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔄 从模拟数据切换到真实 API

当后端 API 准备好后,只需修改 API 层:

```tsx
// 开发环境
export async function getProjects(): Promise<HeritageProject[]> {
  return mockProjects;
}

// 生产环境
export async function getProjects(): Promise<HeritageProject[]> {
  const response = await fetch('/api/projects');
  return response.json();
}
```

## 📝 数据特点

1. **真实性**: 所有数据都基于真实的非遗项目信息
2. **完整性**: 涵盖所有数据库表对应的前端类型
3. **关联性**: 提供了带关联数据的组合类型
4. **可扩展**: 易于添加新的模拟数据

## 🎨 图片资源说明

模拟数据中的图片路径:

- 头像使用 DiceBear API 生成
- 设计图片、关键帧等使用占位路径,需要配合实际的对象存储服务

## 🚀 下一步

1. 创建 API 层封装
2. 实现数据获取 hooks
3. 构建 UI 组件
4. 对接真实后端 API
