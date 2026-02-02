---
trigger: always_on
---

# 前端开发规范

## 一、技术栈与架构

### 1.1 核心技术

- **框架**: React 18.3+ + TypeScript 5.6+
- **构建工具**: Vite 5.4+
- **路由**: React Router DOM 7.11+
- **样式**: Tailwind CSS 4.1+ (原子化 CSS)
- **UI 组件库**: Radix UI + shadcn/ui
- **图标**: Lucide React
- **动画**: Framer Motion
- **HTTP 客户端**: Axios 1.7+
- **包管理器**: pnpm 10.26+

### 1.2 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口层
│   ├── assets/           # 静态资源
│   ├── components/       # 组件目录
│   │   ├── ui/          # 基础 UI 组件 (shadcn/ui)
│   │   ├── layout/      # 布局组件
│   │   └── [feature]/   # 功能组件
│   ├── hooks/            # 自定义 Hooks
│   ├── pages/            # 页面组件
│   ├── services/         # 业务服务层
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── data/             # Mock 数据
│   ├── lib/              # 第三方库配置
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── public/               # 公共资源
├── .env                  # 环境变量
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

---

## 二、编码规范

### 2.1 命名规范

#### 文件命名

- **组件文件**: PascalCase，如 `Navbar.tsx`, `UserProfile.tsx`
- **工具文件**: camelCase，如 `tokenStorage.ts`, `formatDate.ts`
- **类型文件**: camelCase，如 `index.ts`, `auth.ts`
- **样式文件**: kebab-case 或 camelCase，如 `index.css`

**示例**:

```
✅ 推荐
components/layout/Navbar.tsx
utils/tokenStorage.ts
api/auth.ts

❌ 不推荐
components/layout/navbar.tsx
utils/token_storage.ts
api/Auth.ts
```

#### 变量命名

- **组件**: PascalCase
- **函数/变量**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **类型/接口**: PascalCase

```typescript
// ✅ 推荐
const UserProfile: React.FC = () => { ... };
const userName = 'John';
const MAX_RETRY_COUNT = 3;
interface UserData { ... }
type LoginResponse = { ... };

// ❌ 不推荐
const userprofile = () => { ... };
const UserName = 'John';
const maxRetryCount = 3;
interface userData { ... }
```

### 2.2 组件规范

#### 函数组件 (推荐)

使用函数组件 + Hooks，不使用类组件。

```typescript
// ✅ 推荐: 函数组件
export function Navbar() {
    const location = useLocation();
    
    return (
        <nav className="...">
            {/* ... */}
        </nav>
    );
}

// 或使用箭头函数 (默认导出)
export default function Home() {
    return <div>...</div>;
}

// ❌ 不推荐: 类组件
export class Navbar extends React.Component {
    render() {
        return <nav>...</nav>;
    }
}
```

#### 组件导出

- **具名导出**: 用于可复用组件 (`export function ComponentName`)
- **默认导出**: 用于页面组件 (`export default function PageName`)

```typescript
// components/layout/Navbar.tsx
export function Navbar() { ... }

// pages/Home.tsx
export default function Home() { ... }
```

#### Props 类型定义

使用 TypeScript 接口定义 Props，放在组件定义之前。

```typescript
// ✅ 推荐
interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    label: string;
    gradient: string;
}

export function StatCard({ icon: Icon, value, label, gradient }: StatCardProps) {
    return (
        <div className={gradient}>
            <Icon className="w-6 h-6" />
            <span>{value}</span>
            <span>{label}</span>
        </div>
    );
}

// ❌ 不推荐: 使用 any
export function StatCard(props: any) { ... }
```

### 2.3 TypeScript 规范

#### 类型定义

- **接口 (Interface)**: 用于对象结构定义
- **类型别名 (Type)**: 用于联合类型、交叉类型、函数类型

```typescript
// ✅ 推荐: 使用 interface 定义对象
export interface User {
    id: number;
    username: string;
    email?: string;
}

// ✅ 推荐: 使用 type 定义联合类型
export type UserStatus = 'ACTIVE' | 'BANNED' | 'PENDING';

// ✅ 推荐: 使用 type 定义函数类型
export type LoginHandler = (data: LoginRequest) => Promise<void>;
```

#### 避免使用 `any`

```typescript
// ❌ 不推荐
const handleError = (error: any) => { ... };

// ✅ 推荐
const handleError = (error: Error | unknown) => { ... };
```

#### 类型导入

使用 `type` 关键字导入类型。

```typescript
// ✅ 推荐
import { authApi, type LoginResponse, type UserProfile } from '@/api/auth';
import type { LoginRequest, RegisterRequest } from '@/api/auth';

// ❌ 不推荐
import { LoginResponse, UserProfile } from '@/api/auth';
```

### 2.4 样式规范

#### Tailwind CSS 原子化

使用 Tailwind CSS 原子类，避免自定义 CSS。

```tsx
// ✅ 推荐: 使用 Tailwind 原子类
<div className="flex items-center justify-between px-6 py-4 bg-white rounded-lg shadow-md">
    <span className="text-lg font-bold text-gray-800">标题</span>
</div>

// ❌ 不推荐: 自定义 CSS
<div className="custom-container">
    <span className="custom-title">标题</span>
</div>
```

#### 条件样式

使用模板字符串或 `clsx` / `cn` 工具函数。

```tsx
// ✅ 推荐: 模板字符串
<Link
    className={`flex items-center space-x-2 transition-colors ${
        isActive(item.path)
            ? 'text-[#8B4513] font-medium'
            : 'text-gray-600 hover:text-[#8B4513]'
    }`}
>
    {item.label}
</Link>

// ✅ 推荐: 使用 cn 工具函数
import { cn } from '@/lib/utils';

<div className={cn(
    "base-class",
    isActive && "active-class",
    isDisabled && "disabled-class"
)}>
    ...
</div>
```

#### 颜色规范

- **主色调**: `#8B4513` (棕色) - 传统文化
- **辅助色**: `#D4AF37` (金色) - 高贵典雅
- **背景色**: `#F5F5DC` (米色) - 温暖柔和
- **文本色**: `text-gray-600`, `text-gray-800`

```tsx
// ✅ 推荐: 使用项目主题色
<button className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white">
    按钮
</button>

// ❌ 不推荐: 使用随意颜色
<button className="bg-blue-500 text-white">
    按钮
</button>
```

### 2.5 Hooks 规范

#### 自定义 Hooks

- 命名以 `use` 开头
- 放在 `hooks/` 目录
- 返回对象或数组

```typescript
// ✅ 推荐
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [loading, setLoading] = useState(true);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };
}

// 使用
const { user, login, logout } = useAuth();
```

#### Hooks 调用顺序

- 必须在组件顶层调用
- 不能在条件语句、循环或嵌套函数中调用

```typescript
// ✅ 推荐
function MyComponent() {
    const [count, setCount] = useState(0);
    const { user } = useAuth();
    
    if (user) {
        return <div>...</div>;
    }
}

// ❌ 不推荐
function MyComponent() {
    if (condition) {
        const [count, setCount] = useState(0); // ❌ 错误
    }
}
```

### 2.6 API 调用规范

#### API 层分离

将 API 调用封装在 `api/` 目录，不在组件中直接使用 axios。

```typescript
// api/auth.ts
export const authApi = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await authClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    },
};

// 组件中使用
const handleLogin = async () => {
    const response = await authApi.login({ username, password });
};
```

#### 错误处理

使用 try-catch 处理异步错误。

```typescript
// ✅ 推荐
const handleLogin = async () => {
    try {
        await authApi.login({ username, password });
    } catch (error: any) {
        console.error('登录失败:', error.message);
        // 显示错误提示
    }
};

// ❌ 不推荐: 不处理错误
const handleLogin = async () => {
    await authApi.login({ username, password });
};
```

---

## 三、代码组织规范

### 3.1 导入顺序

1. React 相关
2. 第三方库
3. 本地组件
4. 本地工具/类型
5. 样式文件

```typescript
// ✅ 推荐
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, Sparkles } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

import './styles.css';
```

### 3.2 组件结构

```typescript
// 1. 导入
import { ... } from '...';

// 2. 类型定义
interface ComponentProps {
    ...
}

// 3. 常量定义
const CONSTANTS = { ... };

// 4. 组件定义
export function Component({ prop1, prop2 }: ComponentProps) {
    // 4.1 Hooks
    const [state, setState] = useState();
    const { data } = useCustomHook();
    
    // 4.2 事件处理函数
    const handleClick = () => { ... };
    
    // 4.3 副作用
    useEffect(() => { ... }, []);
    
    // 4.4 渲染逻辑
    if (loading) return <div>Loading...</div>;
    
    // 4.5 JSX 返回
    return (
        <div>
            ...
        </div>
    );
}
```

### 3.3 注释规范

#### JSDoc 注释

为公共 API、复杂函数添加 JSDoc 注释。

```typescript
/**
 * 用户认证 Hook
 * 管理用户登录状态、登录、注册、登出等功能
 */
export function useAuth(): UseAuthReturn {
    ...
}

/**
 * 用户登录
 * @param data - 登录请求参数
 * @returns 登录响应数据
 */
async login(data: LoginRequest): Promise<LoginResponse> {
    ...
}
```

#### 行内注释

使用 `//` 注释解释复杂逻辑。

```typescript
// 优先从本地存储获取用户信息
const localUser = authApi.getLocalUser();
if (localUser) {
    setUser(localUser);
}
```

---

## 四、性能优化规范

### 4.1 组件优化

#### 使用 `React.memo`

对不频繁更新的组件使用 `React.memo`。

```typescript
export const StatCard = React.memo(function StatCard({ icon, value, label }: StatCardProps) {
    return <div>...</div>;
});
```

#### 使用 `useCallback` 和 `useMemo`

```typescript
// ✅ 推荐: 缓存回调函数
const handleClick = useCallback(() => {
    console.log('clicked');
}, []);

// ✅ 推荐: 缓存计算结果
const filteredData = useMemo(() => {
    return data.filter(item => item.active);
}, [data]);
```

### 4.2 懒加载

使用 `React.lazy` 和 `Suspense` 实现路由懒加载。

```typescript
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Projects = lazy(() => import('@/pages/Projects'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
            </Routes>
        </Suspense>
    );
}
```

---

## 五、状态管理规范

### 5.1 本地状态

使用 `useState` 管理组件内部状态。

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ username: '', password: '' });
```

### 5.2 全局状态

- **认证状态**: 使用自定义 Hook (`useAuth`)
- **主题状态**: 使用 Context API
- **复杂状态**: 考虑使用 Zustand 或 Jotai (轻量级状态管理)

```typescript
// ✅ 推荐: 使用自定义 Hook
const { user, login, logout } = useAuth();

// ✅ 推荐: 使用 Context
const theme = useTheme();
```

---

## 六、测试规范

### 6.1 单元测试

- 使用 Vitest 或 Jest
- 测试文件命名: `*.test.tsx` 或 `*.spec.tsx`
- 测试覆盖率: 核心业务逻辑 > 80%

```typescript
// utils/tokenStorage.test.ts
import { describe, it, expect } from 'vitest';
import { tokenStorage } from './tokenStorage';

describe('tokenStorage', () => {
    it('should save and retrieve token', () => {
        tokenStorage.setToken('test-token');
        expect(tokenStorage.getToken()).toBe('test-token');
    });
});
```

---

## 七、Git 提交规范

### 7.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新

**示例**:

```
feat(auth): 添加用户登录功能

- 实现登录 API 调用
- 添加 Token 存储
- 创建 useAuth Hook
