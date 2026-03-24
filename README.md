# 🎨 一键抠图 (BgRemover)

基于 Next.js + Tailwind CSS 的轻量级在线图像背景移除工具。

## ✨ 特性

- 🚀 **零门槛** - 无需注册，打开即用
- ⚡ **快速** - 3-5 秒完成处理
- 💰 **免费** - 基础功能完全免费
- 🔒 **隐私** - 图片不落盘，内存处理
- 🎨 **现代化** - Next.js 14 + Tailwind CSS + TypeScript

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **API**: remove.bg
- **部署**: Vercel / Cloudflare Pages

## 📦 项目结构

```
bg-remover-next/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面
│   │   ├── layout.tsx            # 布局
│   │   ├── globals.css           # 全局样式
│   │   └── api/
│   │       └── remove-bg/
│   │           └── route.ts      # API 路由
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd bg-remover-next
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
REMOVE_BG_API_KEY=你的 API Key
```

获取 API Key: https://www.remove.bg/api

### 3. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 🌐 部署

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 设置环境变量
vercel env add REMOVE_BG_API_KEY
```

### Cloudflare Pages 部署

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
npx @cloudflare/next-on-pages
```

## 💰 成本估算

| 项目 | 免费额度 | 付费方案 |
|-----|---------|---------|
| Vercel | 100GB 流量/月 | $20/月 |
| remove.bg API | 50 张/月 | $9/月 (500 张) |

## 📝 API 说明

### POST /api/remove-bg

**请求**: FormData (image 字段)

**响应**: 
- 成功：image/png
- 失败：text/plain (错误信息)

**示例**:

```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/remove-bg', {
  method: 'POST',
  body: formData,
});

const blob = await response.blob();
```

## 📄 License

MIT

## 🙏 致谢

- [remove.bg](https://www.remove.bg/) - 背景移除 API
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先 CSS 框架
