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
