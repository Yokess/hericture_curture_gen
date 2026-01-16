# 基础设施部署指南

本文档说明如何只部署 Docker 基础设施（PostgreSQL、Redis、MinIO），而不部署前端和后端应用。

## 📦 包含的服务

| 服务 | 端口 | 用户名 | 密码 | 说明 |
|------|------|--------|------|------|
| **PostgreSQL** | `5432` | `postgres` | `password` | 数据库（包含 pgvector 扩展） |
| **Redis** | `6379` | - | - | 缓存与消息队列 |
| **MinIO** | `9000` (API)<br>`9001` (控制台) | `minioadmin` | `minioadmin` | S3 兼容对象存储 |

## 🚀 快速启动

### 1. 启动基础设施

在项目根目录执行：

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

### 2. 查看服务状态

```bash
docker-compose -f docker-compose.infrastructure.yml ps
```

预期输出：
```
NAME                    IMAGE                      STATUS
heritage-postgres       pgvector/pgvector:pg16     Up (healthy)
heritage-redis          redis:7                    Up (healthy)
heritage-minio          minio/minio                Up (healthy)
heritage-minio-setup    minio/mc                   Exited (0)
```

### 3. 访问服务

- **PostgreSQL**: `localhost:5432`
  - 数据库名: `heritage_culture`
  - 用户名: `postgres`
  - 密码: `password`
  
- **Redis**: `localhost:6379`
  - 无需密码

- **MinIO 控制台**: http://localhost:9001
  - 用户名: `minioadmin`
  - 密码: `minioadmin`
  - 已自动创建 bucket: `heritage-culture`

## 🔧 常用命令

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.infrastructure.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.infrastructure.yml logs -f postgres
docker-compose -f docker-compose.infrastructure.yml logs -f redis
docker-compose -f docker-compose.infrastructure.yml logs -f minio
```

### 停止服务

```bash
# 停止但保留数据
docker-compose -f docker-compose.infrastructure.yml stop

# 停止并删除容器（数据卷保留）
docker-compose -f docker-compose.infrastructure.yml down

# 停止并删除所有数据（⚠️ 危险操作）
docker-compose -f docker-compose.infrastructure.yml down -v
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.infrastructure.yml restart

# 重启特定服务
docker-compose -f docker-compose.infrastructure.yml restart postgres
```

## 🔌 本地开发连接配置

启动基础设施后，你可以在本地运行前端和后端，连接到 Docker 中的基础设施。

### 后端配置 (application.yml)

确保后端配置文件使用以下连接信息：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/heritage_culture
    username: postgres
    password: password

  redis:
    redisson:
      config: |
        singleServerConfig:
          address: "redis://localhost:6379"

app:
  storage:
    endpoint: http://localhost:9000
    access-key: minioadmin
    secret-key: minioadmin
    bucket: heritage-culture
```

### 前端配置

前端通过 Vite 代理连接后端，无需修改配置。

## 🗄️ 数据持久化

数据存储在 Docker 卷中，即使删除容器也不会丢失：

- `postgres_data`: PostgreSQL 数据
- `redis_data`: Redis 数据
- `minio_data`: MinIO 对象存储数据

查看数据卷：
```bash
docker volume ls | grep heritage
```

## 🧪 验证服务

### 测试 PostgreSQL 连接

```bash
docker exec -it heritage-postgres psql -U postgres -d heritage_culture -c "SELECT version();"
```

### 测试 Redis 连接

```bash
docker exec -it heritage-redis redis-cli ping
```

### 测试 MinIO 连接

访问 http://localhost:9001 并使用 `minioadmin/minioadmin` 登录。

## 📝 注意事项

1. **首次启动**: `createbuckets` 容器会自动创建 `heritage-culture` bucket 并设置为公开访问
2. **数据安全**: 默认密码仅用于开发环境，生产环境请修改密码
3. **端口冲突**: 确保 5432、6379、9000、9001 端口未被占用
4. **pgvector 扩展**: PostgreSQL 已自动启用 pgvector 扩展（通过 init.sql）

## 🔄 从完整部署切换到基础设施部署

如果之前使用 `docker-compose.yml` 启动了完整服务：

```bash
# 1. 停止完整部署
docker-compose down

# 2. 启动基础设施部署
docker-compose -f docker-compose.infrastructure.yml up -d
```

数据卷会被保留，无需担心数据丢失。

