-- 用户表
CREATE TABLE sys_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,                 -- 存储 MinIO Object Key
    email VARCHAR(255) UNIQUE,       -- [新增] 找回密码/通知
    phone VARCHAR(20),               -- [新增] 登录/联系
    status VARCHAR(20) DEFAULT 'ACTIVE', -- [新增] ACTIVE, BANNED
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE -- [新增] 软删除
);

-- 用户荣誉/成就表 (gamification)
CREATE TABLE sys_user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    achievement_name VARCHAR(100),   -- 例如："数字传承官"
    badge_icon_url TEXT,             -- 勋章图标
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 非遗项目主表 (对应你爬取的 project 信息)
CREATE TABLE ich_projects (
    id BIGSERIAL PRIMARY KEY,
    official_id VARCHAR(50) UNIQUE,  -- 对应爬取的 "project_id": "Ⅰ-001..."
    name VARCHAR(255) NOT NULL,      -- "苗族古歌"
    category VARCHAR(100),           -- "民间文学"
    location VARCHAR(255),           -- "贵州省台江县"
    description TEXT,                -- 原始长文本描述
    batch VARCHAR(50),               -- "2006(第一批)"
    official_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 传承人表 (对应你爬取的 successor 信息)
CREATE TABLE ich_successors (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES ich_projects(id), -- 关联项目
    name VARCHAR(100),               -- "王安江"
    gender VARCHAR(10),
    birth_year VARCHAR(20),
    description TEXT,                -- 生平简介
    official_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 核心：知识向量切片表 (RAG 检索专用)
CREATE TABLE ich_knowledge_chunks (
    id BIGSERIAL PRIMARY KEY,
    ref_id BIGINT NOT NULL,          -- 关联项目或传承人ID
    ref_type VARCHAR(20) NOT NULL,    -- 'PROJECT' / 'SUCCESSOR'
    content_text TEXT,
    embedding vector(1536),          -- 百炼 Embedding 维度，请根据实际模型调整（通常1024或1536）
    
    -- [新增] 增强 RAG 上下文理解
    chunk_order INT,                  -- 同一个文档中的切片顺序
    document_id BIGINT,               -- 标识来源文档
    
    metadata JSONB,                  -- 存储来源 URL 等信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);
-- 索引优化
CREATE INDEX idx_knowledge_ref ON ich_knowledge_chunks(ref_id, ref_type);

-- 为向量字段创建 HNSW 索引 (加速检索)
CREATE INDEX ON ich_knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- 创作会话表 (类似 ChatGPT 的左侧历史记录)
CREATE TABLE gen_creative_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    title VARCHAR(100),              -- "剪纸台灯设计"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 设计产物表 (核心成果)
CREATE TABLE gen_artifacts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    
    -- AI 生成内容
    design_name VARCHAR(255),
    design_concept TEXT,             -- 创意说明书
    
    -- [修改] 混元可能一次生成多张预览图
    image_keys TEXT[],                -- 存储 MinIO Object Keys 数组
    selected_index INT DEFAULT 0,     -- 用户选中的主图索引
    
    -- [新增] 生产环境监控
    generation_metadata JSONB,        -- 存储 {"model": "Hunyuan-DiT", "cost_ms": 5400, "requestId": "xxx"}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 技艺视频档案表
CREATE TABLE arc_videos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    project_id BIGINT REFERENCES ich_projects(id),
    
    -- [新增] 视频基础元数据
    original_filename VARCHAR(255),
    video_key TEXT,                   -- MinIO Object Key
    file_size BIGINT,
    mime_type VARCHAR(100),           -- video/mp4 等
    
    analysis_status VARCHAR(20),      -- PENDING, PROCESSING, COMPLETED, FAILED
    error_msg TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE arc_process_steps (
    id BIGSERIAL PRIMARY KEY,
    video_id BIGINT REFERENCES arc_videos(id),
    step_order INT,
    step_name VARCHAR(100),
    description TEXT,
    keyframe_key TEXT,               -- MinIO Object Key
    
    -- [修改] 改为毫秒，方便前端播放器精准跳转
    start_time_ms BIGINT,             
    end_time_ms BIGINT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社区帖子表
CREATE TABLE com_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    artifact_id BIGINT REFERENCES gen_artifacts(id),
    project_id BIGINT REFERENCES ich_projects(id), -- [新增] 关联非遗项目方便筛选
    
    title VARCHAR(200),
    content TEXT,
    tags JSONB,                       -- [新增] 存储风格、非遗种类标签
    
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,  -- [新增] 置顶功能
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- [新增] 关键索引，保证广场加载速度
CREATE INDEX idx_com_posts_project ON com_posts(project_id);
CREATE INDEX idx_com_posts_created ON com_posts(created_at DESC);

-- 用户互动表 (点赞/收藏)
CREATE TABLE com_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sys_users(id),
    post_id BIGINT REFERENCES com_posts(id),
    type VARCHAR(20),                -- 'LIKE' (点赞), 'COLLECT' (收藏)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id, type)   -- 防止重复点赞
);

-- 评论表
CREATE TABLE com_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES com_posts(id),
    user_id BIGINT REFERENCES sys_users(id),
    content VARCHAR(1000),
    parent_id BIGINT,                -- 支持楼中楼回复
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);