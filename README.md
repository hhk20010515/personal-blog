# 个人博客网站 (Personal Blog)

一个现代化的个人博客平台，采用苹果官网风格的UI设计，支持技术、摄影和生活内容分享。

## ✨ 功能特性

### 🎨 用户界面
- **Apple风格设计** - 仿苹果官网的现代化UI和动效
- **响应式布局** - 完美适配桌面、平板和手机
- **深色模式支持** - 自动/手动切换主题
- **流畅动画** - 使用Framer Motion实现丰富的交互动效
- **玻璃态效果** - 现代化的毛玻璃背景效果

### 🔐 用户认证
- **Google OAuth** - 支持Google账号登录
- **微信OAuth** - 支持微信扫码登录
- **邮箱登录** - 魔法链接邮箱登录方式
- **用户管理** - 用户资料、权限和状态管理

### 📝 内容管理
- **多分类支持** - 技术、摄影、生活等分类
- **标签系统** - 灵活的内容标签管理
- **富文本编辑** - Markdown支持的内容编辑
- **媒体管理** - 图片、视频上传和管理
- **SEO优化** - 完整的SEO元数据支持

### 🎯 交互功能
- **点赞评论** - 用户可对文章和评论进行互动
- **书签收藏** - 保存喜欢的文章
- **关注系统** - 关注感兴趣的作者
- **搜索功能** - 全站内容搜索
- **邮件订阅** - 新文章邮件通知

### 🛡️ 管理功能
- **后台管理** - 完整的内容和用户管理界面
- **用户审核** - 违规用户封禁和管理
- **内容审核** - 评论和文章审核机制
- **数据分析** - 访问统计和用户行为分析

## 🚀 技术栈

### 前端
- **Next.js 14** - React全栈框架，支持App Router
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 强大的React动画库
- **Radix UI** - 无障碍的底层UI组件

### 后端
- **Next.js API Routes** - 服务器端API
- **NextAuth.js** - 身份验证解决方案
- **Prisma** - 现代化的数据库ORM
- **PostgreSQL** - 关系型数据库

### 部署和服务
- **Vercel** - 前端部署平台
- **Uploadthing** - 文件上传服务
- **Cloudinary** - 媒体文件存储和处理
- **Nodemailer** - 邮件发送服务

## 📦 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── auth/              # 认证页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── providers.tsx      # 上下文提供者
├── components/            # React组件
│   ├── layout/           # 布局组件
│   ├── sections/         # 页面区块组件
│   └── ui/               # 基础UI组件
├── lib/                  # 工具库
│   ├── prisma.ts         # Prisma客户端
│   ├── db.ts             # 数据库工具函数
│   ├── email.ts          # 邮件服务
│   └── utils.ts          # 通用工具函数
├── prisma/               # 数据库
│   ├── schema.prisma     # 数据库模式
│   └── seed.ts           # 初始数据
├── types/                # TypeScript类型定义
└── hooks/                # 自定义React Hooks
```

## 🛠️ 安装和设置

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd personal-blog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置
复制 `.env.example` 到 `.env.local` 并填入以下信息：

```bash
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/personal_blog"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 微信OAuth
WECHAT_APP_ID="your-wechat-app-id"  
WECHAT_APP_SECRET="your-wechat-app-secret"

# 邮件服务
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# 文件上传
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. 数据库设置
```bash
# 推送数据库模式
npm run db:push

# 生成Prisma客户端
npm run db:generate

# 填充初始数据
npm run db:seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📋 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行ESLint检查
- `npm run db:push` - 推送数据库模式
- `npm run db:generate` - 生成Prisma客户端
- `npm run db:studio` - 打开Prisma Studio
- `npm run db:seed` - 填充数据库初始数据
- `npm run db:reset` - 重置数据库并填充数据

## 🗃️ 数据库模式

### 核心实体
- **User** - 用户信息和认证
- **Post** - 博客文章
- **Category** - 文章分类
- **Tag** - 文章标签
- **Comment** - 评论系统
- **Media** - 媒体文件管理

### 交互功能
- **Like** - 点赞系统
- **Bookmark** - 收藏功能
- **Follow** - 关注系统
- **Notification** - 通知系统

### 分析和管理
- **PageView** - 访问统计
- **Subscriber** - 邮件订阅
- **Session/Account** - NextAuth.js会话管理

## 🔧 配置说明

### OAuth提供商设置

**Google OAuth:**
1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建OAuth 2.0客户端ID
3. 添加授权重定向URI: `http://localhost:3000/api/auth/callback/google`

**微信OAuth:**
1. 注册微信开放平台账号
2. 创建网站应用
3. 获取AppID和AppSecret

### 邮件服务设置
推荐使用Gmail SMTP：
1. 启用2FA
2. 生成应用专用密码
3. 配置SMTP设置

## 🚀 部署

### Vercel部署
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 设置数据库连接
4. 部署应用

### 数据库部署
推荐使用以下数据库服务：
- **Supabase** - 免费PostgreSQL
- **PlanetScale** - 免费MySQL
- **Railway** - 支持多种数据库

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系

如有问题，请通过以下方式联系：
- 邮箱: hhk20010515@gmail.com
