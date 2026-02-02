---
trigger: always_on
description: 非遗文化智能创意生成平台 - 后端开发规范
---

# 后端开发规范

## 一、技术栈与架构

### 1.1 核心技术

- **框架**: Spring Boot 4.0 + Java 21
- **权限认证**: Sa-Token
- **AI集成**: Spring AI 2.0 (OpenAI兼容模式)
- **数据库**: PostgreSQL 14+ (含 pgvector 向量扩展)
- **缓存/消息**: Redis 6+ (Stream 消息队列)
- **构建工具**: Gradle 8.14
- **对象映射**: MapStruct 1.6.3
- **文档解析**: Apache Tika 2.9.2
- **PDF导出**: iText 8.0.5

### 1.2 架构分层

```
heritage.gen
├── common/              # 通用基础设施层
│   ├── config/         # 配置类
│   ├── constant/       # 常量定义
│   ├── exception/      # 异常处理
│   ├── model/          # 通用模型
│   └── result/         # 统一响应结果
├── infrastructure/      # 基础设施服务层
│   ├── file/           # 文件处理服务
│   └── redis/          # Redis服务
└── modules/            # 业务模块层
    └── knowledgebase/  # 知识库模块
        ├── listener/   # 消息监听器
        ├── model/      # 领域模型
        ├── repository/ # 数据访问层
        └── service/    # 业务逻辑层
```

---

## 二、编码规范

### 2.1 包命名规范

- **全小写**: 包名必须全部小写，不使用下划线或驼峰
- **层级清晰**: 按功能模块和技术分层组织
- **示例**:

  ```
  heritage.gen.modules.knowledgebase.service
  heritage.gen.common.exception
  heritage.gen.infrastructure.file
  ```

### 2.2 类命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Controller | `*Controller` | `KnowledgeBaseController` |
| Service | `*Service` | `KnowledgeBaseUploadService` |
| Repository | `*Repository` | `KnowledgeBaseRepository` |
| Entity | `*Entity` | `KnowledgeBaseEntity` |
| DTO | `*DTO` | `KnowledgeBaseListItemDTO` |
| Config | `*Config` 或 `*ConfigProperties` | `CorsConfig`, `AppConfigProperties` |
| Exception | `*Exception` | `BusinessException` |
| Listener/Consumer | `*Consumer` 或 `*Producer` | `VectorizeStreamConsumer` |

### 2.3 方法命名规范

- **动词开头**: 方法名必须以动词开头，清晰表达行为
- **驼峰命名**: 使用小驼峰命名法
- **常用前缀**:
  - `get*`: 查询单个对象
  - `list*`: 查询列表
  - `find*`: 条件查询
  - `save*`: 保存数据
  - `update*`: 更新数据
  - `delete*`: 删除数据
  - `validate*`: 验证逻辑
  - `handle*`: 处理逻辑
  - `extract*`: 提取数据

**示例**:

```java
// ✅ 推荐
public List<KnowledgeBaseListItemDTO> listKnowledgeBases()
public Optional<KnowledgeBaseEntity> getKnowledgeBase(Long id)
public void validateContentType(String contentType, String fileName)
public String extractNameFromFilename(String filename)

// ❌ 不推荐
public List<KnowledgeBaseListItemDTO> knowledgeBases()  // 缺少动词
public Optional<KnowledgeBaseEntity> kb(Long id)        // 名称不清晰
```

### 2.4 变量命名规范

- **有意义的名称**: 避免单字母变量（循环除外）
- **驼峰命名**: 使用小驼峰命名法
- **常量**: 全大写 + 下划线分隔

```java
// ✅ 推荐
private final KnowledgeBaseUploadService uploadService;
private static final int MAX_FILE_SIZE = 10 * 1024 * 1024;
String originalFilename = file.getOriginalFilename();

// ❌ 不推荐
private final KnowledgeBaseUploadService kbus;  // 缩写不清晰
private static final int maxFileSize = 10485760;  // 常量应全大写
String fn = file.getOriginalFilename();  // 变量名太短
```

---

## 三、代码组织规范

### 3.1 Controller 层规范

**职责**: 仅负责接收请求、参数校验、调用 Service、返回响应

```java
@Slf4j
@RestController
@RequiredArgsConstructor  // 使用构造器注入
public class KnowledgeBaseController {

    private final KnowledgeBaseUploadService uploadService;
    private final KnowledgeBaseQueryService queryService;

    /**
     * 上传知识库文件
     */
    @PostMapping(value = "/api/knowledgebase/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> uploadKnowledgeBase(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "category", required = false) String category) {
        return Result.success(uploadService.uploadKnowledgeBase(file, name, category));
    }
}
```

**要点**:

- ✅ 使用 `@RequiredArgsConstructor` 实现构造器注入
- ✅ 统一返回 `Result<T>` 包装响应
- ✅ 添加清晰的 Javadoc 注释
- ✅ 使用 `@Valid` 进行参数校验
- ❌ 不在 Controller 中编写业务逻辑
- ❌ 不直接操作 Repository

### 3.2 Service 层规范

**职责**: 实现核心业务逻辑，协调多个 Repository 和基础设施服务

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeBaseUploadService {

    private final KnowledgeBaseRepository repository;
    private final FileStorageService fileStorageService;
    private final FileHashService fileHashService;
    private final VectorizeStreamProducer vectorizeProducer;

    /**
     * 上传知识库文件
     * 
     * @param file 知识库文件
     * @param name 知识库名称（可选，如果为空则从文件名提取）
     * @param category 分类（可选）
     * @return 上传结果和存储信息（包含duplicate字段,表示是否为重复上传）
     */
    @Transactional
    public Map<String, Object> uploadKnowledgeBase(MultipartFile file, String name, String category) {
        // 1. 计算文件哈希值（去重）
        String fileHash = fileHashService.calculateHash(file);
        
        // 2. 检查是否重复上传
        Optional<KnowledgeBaseEntity> existingKb = repository.findByFileHash(fileHash);
        if (existingKb.isPresent()) {
            return handleDuplicateKnowledgeBase(existingKb.get(), fileHash);
        }
        
        // 3. 上传文件到 RustFS
        var uploadResult = fileStorageService.uploadFile(file, "knowledge-base");
        
        // 4. 保存元数据到数据库
        var savedKb = saveKnowledgeBase(file, name, category, 
                                        uploadResult.storageKey(), 
                                        uploadResult.storageUrl(), 
                                        fileHash);
        
        // 5. 发送异步向量化任务
        vectorizeProducer.sendVectorizeTask(savedKb.getId());
        
        return Map.of(
            "id", savedKb.getId(),
            "name", savedKb.getName(),
            "duplicate", false
        );
    }
}
```

**要点**:

- ✅ 单一职责: 每个 Service 类专注于一个业务领域
- ✅ 细粒度服务: 复杂模块拆分为多个 Service (如 `UploadService`, `QueryService`, `DeleteService`)
- ✅ 使用 `@Transactional` 管理事务
- ✅ 详细的 Javadoc 注释（参数、返回值、异常）
- ✅ 私有方法拆分复杂逻辑，提升可读性
- ❌ 不在 Service 中处理 HTTP 请求/响应
- ❌ 避免 Service 之间的循环依赖

### 3.3 Repository 层规范

**职责**: 数据访问层，仅负责数据库操作

```java
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBaseEntity, Long> {
    
    /**
     * 根据文件哈希查找知识库（用于去重）
     */
    Optional<KnowledgeBaseEntity> findByFileHash(String fileHash);
    
    /**
     * 根据分类查询知识库列表
     */
    List<KnowledgeBaseEntity> findByCategory(String category);
    
    /**
     * 根据名称模糊搜索
     */
    @Query("SELECT kb FROM KnowledgeBaseEntity kb WHERE kb.name LIKE %:keyword% OR kb.originalFilename LIKE %:keyword%")
    List<KnowledgeBaseEntity> searchByKeyword(@Param("keyword") String keyword);
}
```

**要点**:

- ✅ 继承 `JpaRepository<Entity, ID>`
- ✅ 使用 Spring Data JPA 方法命名规范
- ✅ 复杂查询使用 `@Query` 注解
- ✅ 添加方法注释说明用途
- ❌ 不在 Repository 中编写业务逻辑

### 3.4 Entity 层规范

**职责**: 数据库表映射，领域模型

```java
@Entity
@Table(name = "knowledge_bases", indexes = {
    @Index(name = "idx_kb_hash", columnList = "fileHash", unique = true),
    @Index(name = "idx_kb_category", columnList = "category")
})
public class KnowledgeBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 文件内容的SHA-256哈希值，用于去重
    @Column(nullable = false, unique = true, length = 64)
    private String fileHash;

    // 知识库名称（用户自定义或从文件名提取）
    @Column(nullable = false)
    private String name;

    // 向量化状态（新上传时为 PENDING，异步处理完成后变为 COMPLETED）
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VectorStatus vectorStatus = VectorStatus.PENDING;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();
        accessCount = 1;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    // 业务方法
    public void incrementAccessCount() {
        this.accessCount++;
        this.lastAccessedAt = LocalDateTime.now();
    }
}
```

**要点**:

- ✅ 使用 JPA 注解映射表结构
- ✅ 添加必要的索引 (`@Index`)
- ✅ 字段添加清晰的注释
- ✅ 使用 `@PrePersist` 等生命周期钩子
- ✅ 可以包含简单的业务方法（如 `incrementAccessCount()`）
- ❌ **不使用 Lombok** (项目当前未在 Entity 中使用 `@Data`)
- ❌ 避免在 Entity 中引入复杂业务逻辑

### 3.5 DTO 规范

**职责**: 数据传输对象，用于 API 响应

```java
/**
 * 知识库列表项 DTO
 */
public record KnowledgeBaseListItemDTO(
    Long id,
    String name,
    String category,
    String originalFilename,
    Long fileSize,
    String contentType,
    LocalDateTime uploadedAt,
    Integer accessCount,
    Integer questionCount,
    VectorStatus vectorStatus,
    String vectorError,
    Integer chunkCount
) {}
```

**要点**:

- ✅ 使用 Java 17+ 的 `record` 类型（不可变、简洁）
- ✅ 仅包含需要传输的字段
- ✅ 添加 Javadoc 注释
- ❌ 不在 DTO 中包含业务逻辑

---

## 四、异常处理规范

### 4.1 自定义业务异常

```java
public class BusinessException extends RuntimeException {
    
    private final Integer code;
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public Integer getCode() {
        return code;
    }
}
```

### 4.2 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)  // 业务异常返回 200，通过业务码区分
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }
    
    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return Result.error(ErrorCode.BAD_REQUEST, message);
    }
}
```

**要点**:

- ✅ 所有异常统一返回 HTTP 200，通过业务错误码区分
- ✅ 记录详细的日志（区分 `warn` 和 `error`）
- ✅ 返回用户友好的错误信息
- ❌ 不暴露敏感的系统信息

### 4.3 异常抛出规范

```java
// ✅ 推荐: 使用自定义业务异常
if (file.isEmpty()) {
    throw new BusinessException(ErrorCode.BAD_REQUEST, "文件不能为空");
}

// ✅ 推荐: 使用 ErrorCode 枚举
throw new BusinessException(ErrorCode.KNOWLEDGE_BASE_NOT_FOUND);

// ❌ 不推荐: 直接抛出通用异常
throw new RuntimeException("文件不能为空");
```

---

## 五、统一响应格式

### 5.1 Result 包装类

```java
@Getter
public class Result<T> {
    
    private final Integer code;
    private final String message;
    private final T data;
    
    // 成功响应
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    // 失败响应
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}
```

### 5.2 响应示例

```json
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Java面试题库"
  }
}

// 失败响应
{
  "code": 4001,
  "message": "知识库不存在",
  "data": null
}
```

---

## 六、日志规范

### 6.1 日志级别

- **ERROR**: 系统错误、异常堆栈
- **WARN**: 业务异常、参数校验失败
- **INFO**: 关键业务流程（上传、查询、删除）
- **DEBUG**: 详细调试信息（开发环境）

**最后更新**: 2026-02-01  
**维护者**: 开发团队
