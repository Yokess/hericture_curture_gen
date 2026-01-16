<div align="center">

**融合RAG技术与扩散模型的非遗文化智能创意生成平台**

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql)](https://www.postgresql.org/)


</div>


---

## 项目介绍

本项目是一套集"深层次知识解读、专业级设计辅助、结构化技艺归档、社会化创意传播"于一体的智能平台。针对非遗文化传播门槛高、创意产出难、数字化手段单一等问题，利用大语言模型（LLM）、RAG检索增强生成和向量数据库技术，为用户提供非遗知识问答、AI文创设计、技艺数字化档案和创意分享社区等服务。

## 系统角色

- **用户**：学习非遗知识，利用 AI 生成文创设计，在社区进行互动分享
- **管理员**：维护专业知识库，上传教学视频，对社区违规内容进行管理
- **AI 引擎**（后台服务）：执行 RAG 检索、提示词扩写、图像生成、视频多模态解析

## 系统架构

**异步处理流程**：

视频解析、知识库向量化和设计方案生成采用 Redis Stream 异步处理：

```
上传请求 → 保存文件 → 发送消息到 Stream → 立即返回
                              ↓
                      Consumer 消费消息
                              ↓
                    执行解析/向量化/生成任务
                              ↓
                      更新数据库状态
                              ↓
                   前端轮询获取最新状态
```

状态流转： `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`

## 技术栈

### 后端技术

| 技术                  | 版本  | 说明                      |
| --------------------- | ----- | ------------------------- |
| Spring Boot           | 4.0   | 应用框架                  |
| Java                  | 21    | 开发语言                  |
| Spring AI             | 2.0   | AI 集成框架               |
| PostgreSQL + pgvector | 14+   | 关系数据库 + 向量存储     |
| Redis                 | 6+    | 缓存 + 消息队列（Stream） |
| Apache Tika           | 2.9.2 | 文档解析                  |
| iText 8               | 8.0.5 | PDF 导出                  |
| MapStruct             | 1.6.3 | 对象映射                  |
| Gradle                | 8.14  | 构建工具                  |

技术选型常见问题解答：

1. 数据存储为什么选择 PostgreSQL + pgvector？PG 的向量数据存储功能够用了，精简架构，不想引入太多组件。
2. 为什么引入 Redis？
   - Redis 实现会话缓存和状态管理。
   - 基于 Redis Stream 实现视频解析、知识库向量化、设计方案生成等场景的异步处理（还能解耦，可以使用其他编程语言来做）。不使用 Kafka 这类成熟的消息队列，也是不想引入太多组件。
3. 构建工具为什么选择 Gradle？个人更喜欢用 Gradle。

### 前端技术

| 技术          | 版本  | 说明     |
| ------------- | ----- | -------- |
| React         | 18.3  | UI 框架  |
| TypeScript    | 5.6   | 开发语言 |
| Vite          | 5.4   | 构建工具 |
| Tailwind CSS  | 4.1   | 样式框架 |
| React Router  | 7.11  | 路由管理 |
| Framer Motion | 12.23 | 动画库   |
| Recharts      | 3.6   | 图表库   |
| Lucide React  | 0.468 | 图标库   |

## 功能需求

### F1 智能非遗专家系统（RAG 模块）

- **F1.1 语义精准问答**：基于私有非遗知识库（PDF/文档），通过向量检索回答用户提问，杜绝通用大模型的"事实幻觉"
- **F1.2 知识源溯源**：AI 回答需标注引用自哪份非遗文档，确保权威性
- **F1.3 知识图谱预览**：对非遗项目的历史、分布、代表人物进行结构化展示

### F2 AI 文创设计工作站（生成模块）

- **F2.1 "总设计师"引导**：AI 通过对话引导用户确定设计目标（如：材质、风格、载体）
- **F2.2 工业设计草图生成**：核心功能。生成具有手绘感、带技术标注、多视角（三视图）的专业设计图
- **F2.3 商业效果图生成**：生成高精度、可直接用于展示的文创产品渲染图
- **F2.4 设计方案导出**：将设计图与 AI 自动生成的创意说明书（包含寓意解析、材质建议）导出为 PDF

### F3 技艺数字化档案（异步解析模块）

- **F3.1 视频异步解析**：采用 Redis Stream 队列，异步处理视频上传与分析
- **F3.2 自动工序提取**：通过 FFmpeg 抽帧与视觉大模型，自动提取视频中的"1.构图-2.剪样-3.刻画"等步骤
- **F3.3 结构化标注展示**：前端展示"关键帧图片+文字描述+视频时间点"的工艺路径图

### F4 创意分享社区（UGC 模块）

- **F4.1 作品广场**：用户可将设计方案发布至社区，支持瀑布流展示和类别筛选
- **F4.2 创意"同款"（Remix）**：用户可查看他人公开的设计灵感（提示词），并基于此进行二次创作
- **F4.3 社交互动**：支持对作品进行点赞、评论和收藏
- **F4.4 个人成就系统**：记录用户的创作数量、获赞数，授予"数字传承官"等荣誉勋章
- PDF 简历分析报告导出

### 知识库管理模块

- 多格式支持（PDF、DOCX、DOC、TXT、Markdown）
- 文档上传和自动分块
- 异步向量化处理
- RAG 检索增强生成
- 流式响应（SSE）
- 智能问答对话
- 知识库统计信息

### TODO

- [x] 问答助手的 Markdown 展示优化
- [x] 知识库管理页面的知识库下载
- [x] 异步生成模拟面试评估报告
- [x] Docker 快速部署
- [ ] 添加 API 限流保护
- [ ] 前端性能优化（虚拟列表等）
- [ ] 模拟面试增加追问功能
- [ ] 打通模拟面试和知识库

## 效果展示

### 简历与面试

简历库：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-history.png)

简历上传分析：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-upload-analysis.png)

简历分析详情：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-analysis-detail.png)

面试记录：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-history.png)

面试详情：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-detail.png)

模拟面试：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-mock-interview.png)

### 知识库

知识库管理：

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-knowledge-base-management.png)

问答助手：

![page-qa-assistant](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-qa-assistant.png)

## 项目结构

```
interview-guide/
├── app/                              # 后端应用
│   ├── src/main/java/interview/guide/
│   │   ├── App.java                  # 主启动类
│   │   ├── common/                   # 通用模块
│   │   │   ├── config/               # 配置类
│   │   │   ├── exception/            # 异常处理
│   │   │   └── result/               # 统一响应
│   │   ├── infrastructure/           # 基础设施
│   │   │   ├── export/               # PDF 导出
│   │   │   ├── file/                 # 文件处理
│   │   │   ├── redis/                # Redis 服务
│   │   │   └── storage/              # 对象存储
│   │   └── modules/                  # 业务模块
│   │       ├── interview/            # 面试模块
│   │       ├── knowledgebase/        # 知识库模块
│   │       └── resume/               # 简历模块
│   └── src/main/resources/
│       ├── application.yml           # 应用配置
│       └── prompts/                  # AI 提示词模板
│
├── frontend/                         # 前端应用
│   ├── src/
│   │   ├── api/                      # API 接口
│   │   ├── components/               # 公共组件
│   │   ├── pages/                    # 页面组件
│   │   ├── types/                    # 类型定义
│   │   └── utils/                    # 工具函数
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 快速开始

环境要求：

| 依赖          | 版本 | 必需 |
| ------------- | ---- | ---- |
| JDK           | 21+  | 是   |
| Node.js       | 18+  | 是   |
| PostgreSQL    | 14+  | 是   |
| pgvector 扩展 | -    | 是   |
| Redis         | 6+   | 是   |
| S3 兼容存储   | -    | 是   |

### 1. 克隆项目

```bash
git clone https://github.com/Snailclimb/interview-guide.git
cd interview-guide
```

### 2. 配置数据库

```sql
-- 创建数据库
CREATE DATABASE heritage_culture;

-- 连接数据库并启用 pgvector 扩展（可选，启动后端SpringAI框架底层会自动创建）
CREATE EXTENSION vector;
```

### 3. 配置环境变量

```bash
# AI API 密钥（阿里云 DashScope）
export AI_BAILIAN_API_KEY=your_api_key
```

### 4. 修改应用配置

编辑 `app/src/main/resources/application.yml`：

```yaml
spring:
  # PostgreSQL数据库配置
  datasource:
    url: jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:heritage_culture}
    username: ${POSTGRES_USER:postgres}
    password: ${POSTGRES_PASSWORD:123456}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: create #首次启动用 create，表创建成功后，改回 update

  # Redisson配置 (使用 spring.redis.redisson，参考官方文档)
  redis:
    redisson:
      config: |
        singleServerConfig:
          address: "redis://${REDIS_HOST:localhost}:${REDIS_PORT:6379}"
          database: 0
          connectionMinimumIdleSize: 10
          connectionPoolSize: 64
          subscriptionConnectionMinimumIdleSize: 1
          subscriptionConnectionPoolSize: 50

# RustFS (S3兼容) 存储配置
app:
  storage:
    endpoint: ${APP_STORAGE_ENDPOINT:http://localhost:9000}
    access-key: ${APP_STORAGE_ACCESS_KEY:wr45VXJZhCxc6FAWz0YR}
    secret-key: ${APP_STORAGE_SECRET_KEY:GtKxV57WJkpw4CvASPBzTy2DYElLnRqh8dIXQa0m}
    bucket: ${APP_STORAGE_BUCKET:heritage-culture}
    region: ${APP_STORAGE_REGION:us-east-1}
    


```

⚠️**注意**：

1.  JPA 的 `ddl-auto` 首次启动用 `create`，表创建成功后，改回 `update`。
2. 如果本地已经 Minio 的话，可以用其替换 RusfFS。

### 5. 启动服务

**后端：**

```bash
./gradlew bootRun
```

后端服务启动于 `http://localhost:8080`

**前端：**

```bash
cd frontend
pnpm install
pnpm dev
```

前端服务启动于 `http://localhost:5173`


## Docker 快速部署

本项目提供了完整的 Docker 支持，可以一键启动所有服务（前后端、数据库、中间件）。

### 1. 前置准备
- 安装 [Docker](https://www.docker.com/products/docker-desktop/) 和 Docker Compose
- 申请阿里云百炼 API Key（用于 AI 对话功能）

### 2. 快速启动
在项目根目录下执行：

```bash
# 1. 复制环境变量配置文件
cp .env.example .env

# 2. 编辑 .env 文件，填入 AI 配置
# vim .env
# 必填：AI_BAILIAN_API_KEY=your_key_here
# 可选：AI_MODEL=qwen-plus        # 默认值为 qwen-plus
#        # 也可以改为 qwen-max、qwen-long 等其他可用模型

# 3. 构建并启动所有服务
docker-compose up -d --build
```

### 3. 服务访问
启动完成后，您可以通过以下地址访问各个服务：

| 服务             | 地址                                           | 默认账号     | 默认密码     | 说明                   |
| ---------------- | ---------------------------------------------- | ------------ | ------------ | ---------------------- |
| **前端应用**     | [http://localhost](http://localhost)           | -            | -            | 用户访问入口           |
| **后端 API**     | [http://localhost:8080](http://localhost:8080) | -            | -            | Swagger/接口文档       |
| **MinIO 控制台** | [http://localhost:9001](http://localhost:9001) | `minioadmin` | `minioadmin` | 对象存储管理           |
| **MinIO API**    | `localhost:9000`                               | -            | -            | S3 兼容接口            |
| **PostgreSQL**   | `localhost:5432`                               | `postgres`   | `password`   | 数据库 (包含 pgvector) |
| **Redis**        | `localhost:6379`                               | -            | -            | 缓存与消息队列         |

### 4. 常用运维命令

```bash
# 查看服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f app

# 停止并移除所有服务
docker-compose down

# 清理无用镜像（构建产生的中间层）
docker image prune -f
```

## 使用场景

| 用户角色        | 使用场景                                           |
| --------------- | -------------------------------------------------- |
| **文化爱好者**  | 学习非遗知识，利用AI生成文创设计                   |
| **设计师**      | 获取非遗元素灵感，生成专业设计草图和效果图         |
| **教育机构**    | 上传非遗教学视频，自动提取工艺步骤，建立数字档案   |
| **文创企业**    | 基于非遗知识库进行产品创意设计，导出设计方案       |

## 常见问题

### Q: 数据库表创建失败/数据丢失

这大概率是 JPA 的 `ddl-auto` 配置不对的原因。`ddl-auto` 模式对比：

| 模式     | 行为                            | 适用场景      |
| -------- | ------------------------------- | ------------- |
| create   | 无条件删除并重建所有表          | 开发/测试环境 |
| update   | 对比现有 schema，只执行增量更新 | 开发环境      |
| validate | 只验证，不修改                  | 生产环境      |
| none     | 什么都不做                      | 生产环境      |

对于新数据库，推荐：

```yaml
# 首次启动用 create
jpa:
  hibernate:
    ddl-auto: create

# 表创建成功后，改回 update
jpa:
  hibernate:
    ddl-auto: update
```

记得改回 **update**，否则每次重启都会删除所有数据！

### Q: 知识库向量化失败

当 `initialize-schema: false` 时，Spring AI **不会自动创建** `vector_store` 表。

```java
spring:
  ai:
    vectorstore:
      pgvector:
        initialize-schema: true 

```
