# Aphelion Pulsar - 未来主义个人博客

一个基于 Next.js 16 构建的高性能、未来主义风格的个人博客平台。采用 SQLite 作为本地数据库，结合现代化的 Web 技术栈，提供流畅的用户体验和丰富的功能。

## ✨ 核心特性

-   **未来主义设计**：深空背景、霓虹点缀（青色/紫色）以及精致的毛玻璃特效 (Glassmorphism)。
-   **全栈功能**：
    -   **博客系统**：支持 Markdown 渲染、代码高亮、标签分类。
    -   **用户系统**：注册、登录、个人主页、等级展示。
    -   **社交互动**：评论、关注/粉丝系统、用户动态。
    -   **侧边栏功能**：新用户展示、快捷导航、个人数据统计。
-   **高性能架构**：
    -   **Next.js 16 App Router**：利用 React Server Components 实现极致的首屏加载和 SEO。
    -   **SQLite 数据库**：使用 `better-sqlite3` 提供快速、可靠的本地数据存储，无需复杂的数据库配置。
    -   **Server Actions**：现代化的数据变更处理，内置 Zod 验证，安全高效。
-   **极致体验**：
    -   **响应式布局**：完美适配移动端、平板和桌面端。
    -   **骨架屏加载**：优雅的数据加载状态。
    -   **纯净 CSS**：使用 CSS Modules 和 CSS 变量，无冗余样式库依赖。

## 🛠️ 技术栈

-   **框架**: [Next.js 16](https://nextjs.org/) (App Router)
-   **语言**: TypeScript
-   **数据库**: SQLite (`better-sqlite3`)
-   **验证**: Zod
-   **样式**: CSS Modules, Vanilla CSS
-   **Markdown**: `react-markdown`, `rehype-highlight`, `remark-gfm`

## 🚀 快速开始

### 1. 环境准备

确保你的环境中有 Node.js (推荐 v18+)。

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

项目内置了数据库初始化脚本，运行以下命令创建数据库表并填充演示数据：

```bash
node scripts/seed-db.js
```

这将创建一个 `aphelion.db` 文件，并添加一个默认用户 (`demo_user`) 和一篇示例文章。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到运行中的博客。

## 📂 项目结构

```
src/
├── actions/        # Server Actions (处理表单提交、数据变更)
├── app/            # Next.js App Router 页面路由
│   ├── api/        # API 路由
│   ├── blog/       # 博客文章详情页
│   ├── login/      # 登录页
│   ├── register/   # 注册页
│   ├── user/       # 用户个人主页
│   ├── globals.css # 全局样式和 CSS 变量
│   ├── layout.tsx  # 根布局
│   └── page.tsx    # 首页
├── components/     # 可复用 UI 组件 (Navbar, Sidebar, PostCard 等)
├── lib/            # 工具库
│   ├── db.ts       # 数据库连接与 CRUD 操作 (better-sqlite3)
│   └── schemas.ts  # Zod 验证模式
└── scripts/        # 脚本文件 (如数据库种子脚本)
```

## 🎨 个性化定制

你可以通过编辑 `src/app/globals.css` 中的 CSS 变量来快速更改主题色：

```css
:root {
  --primary: #00f2ff; /* 主霓虹色 */
  --secondary: #bd00ff; /* 次霓虹色 */
  --bg-dark: #050505; /* 背景色 */
}
```

## 📝 开发指南

-   **添加新文章**：可以通过 `/blog/new` 页面（需登录）或直接操作数据库添加。
-   **数据库管理**：推荐使用 DBeaver 或 SQLite Browser 打开 `aphelion.db` 文件进行可视化管理。

## 📄 许可证

MIT License
