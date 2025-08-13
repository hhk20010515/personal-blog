# 🚀 个人博客部署指南

## 推荐部署方案：Vercel

### 为什么选择 Vercel？
- ✅ Next.js 官方推荐平台，完美支持所有功能
- ✅ 自动 CI/CD，Git 推送即部署
- ✅ 全球 CDN，访问速度快
- ✅ 自动 HTTPS 证书
- ✅ 简单的环境变量管理
- ✅ 免费额度足够个人使用

## 📋 部署前准备清单

### 1. 代码仓库
```bash
# 初始化 Git 仓库（如果还没有的话）
git init
git add .
git commit -m "Initial commit: Complete personal blog"

# 推送到 GitHub/GitLab
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. 环境变量准备
确保以下环境变量已准备好：

**数据库配置:**
```
DATABASE_URL=postgresql://username:password@your-host.neon.tech/database?sslmode=require&channel_binding=require
```

**身份验证:**
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**邮件服务（可选）:**
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## 🔧 Vercel 部署步骤

### 第一步：连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab 账号登录
3. 点击 "New Project"
4. 选择你的代码仓库
5. Vercel 会自动识别为 Next.js 项目

### 第二步：配置环境变量
在 Vercel 项目设置中添加环境变量：
1. 进入项目 Dashboard
2. 点击 "Settings" -> "Environment Variables"
3. 添加所有必需的环境变量
4. 选择适用环境：Production, Preview, Development

### 第三步：部署配置
项目已包含 `vercel.json` 配置文件，包含：
- 构建命令配置
- API 路由超时设置（30秒）
- 安全头设置
- 重定向规则

### 第四步：数据库初始化
首次部署后，需要初始化数据库：

**方法1：使用 Vercel CLI**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并链接项目
vercel login
vercel link

# 在生产环境运行数据库命令
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

**方法2：通过 API 端点**
访问 `https://your-domain.vercel.app/api/auth/signin` 进行首次登录，系统会自动创建必要的数据库表。

### 第五步：域名配置
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加自定义域名（可选）
3. 按照指引配置 DNS 记录

## 🔐 生产环境安全配置

### Google OAuth 重新配置
部署到生产环境后，需要更新 Google OAuth 配置：
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入你的项目 -> APIs & Services -> Credentials
3. 编辑 OAuth 2.0 客户端
4. 在授权重定向 URI 中添加：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

### NEXTAUTH_URL 更新
将环境变量中的 `NEXTAUTH_URL` 更新为生产环境地址：
```
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 📊 部署后验证

### 功能检查清单
- [ ] 首页正常加载
- [ ] Google OAuth 登录正常
- [ ] 管理员账号可以访问后台
- [ ] 文章发布功能正常
- [ ] 技术/摄影/生活页面正常显示
- [ ] 文章列表和搜索功能正常
- [ ] 评论系统工作正常
- [ ] 图片上传功能正常（如果配置了 Cloudinary）

### 性能监控
Vercel 提供内置的性能监控：
1. 访问项目 Dashboard
2. 查看 "Analytics" 标签
3. 监控页面加载时间和用户访问情况

## 🔄 持续部署

### 自动部署
- 每次推送到 main 分支会自动触发部署
- Preview 部署：推送到其他分支会创建预览环境
- 部署状态会实时显示在 GitHub PR 中

### 回滚操作
如果需要回滚：
1. 在 Vercel Dashboard 中选择之前的部署
2. 点击 "Promote to Production"

## 🆘 常见问题解决

### 1. 数据库连接错误
- 检查 `DATABASE_URL` 环境变量是否正确
- 确保 Neon 数据库正常运行
- 验证网络连接权限

### 2. OAuth 登录失败
- 确认 Google OAuth 配置中的重定向 URI 正确
- 检查 `NEXTAUTH_URL` 环境变量
- 验证 `NEXTAUTH_SECRET` 已设置

### 3. 构建失败
- 检查 TypeScript 类型错误
- 确认所有依赖已正确安装
- 查看构建日志中的详细错误信息

### 4. 静态文件加载问题
- 确保图片等静态资源路径正确
- 检查 CDN 缓存是否需要清除

## 📞 支持资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 生产环境指南](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js 部署](https://next-auth.js.org/deployment)

---

🎉 **恭喜！** 你的个人博客现在已准备好部署到生产环境了！