# 数据库配置指南 - Neon

## 🎯 快速开始（5分钟完成）

### 1. 注册 Neon 账号
1. 访问 https://neon.tech
2. 点击 **"Sign Up"** 
3. 使用 GitHub 账号登录（推荐）或邮箱注册

### 2. 创建数据库项目
1. 登录后点击 **"Create Project"**
2. 选择以下配置：
   - **Project name**: `personal-blog`
   - **Database name**: `personal_blog` 
   - **Region**: 选择距离您最近的区域
   - **PostgreSQL Version**: 使用默认最新版本

3. 点击 **"Create Project"** 创建

### 3. 获取连接字符串
1. 项目创建后，在 Dashboard 页面找到 **"Connection Details"**
2. 复制 **"Connection string"** (类似这样)：
   ```
   postgresql://username:password@hostname.neon.tech/dbname?sslmode=require
   ```

### 4. 更新环境变量
1. 打开项目根目录的 `.env` 文件
2. 找到 `DATABASE_URL` 并替换为您的连接字符串：
   ```bash
   DATABASE_URL="您复制的连接字符串"
   ```

## 🚀 初始化数据库

运行以下命令完成数据库设置：

```bash
# 1. 推送数据库模式到 Neon
npm run db:push

# 2. 生成 Prisma 客户端
npm run db:generate  

# 3. 填充基础数据（分类、标签等）
npm run db:seed

# 4. 启动开发服务器
npm run dev
```

## 📊 验证配置

如果一切正常，您应该看到：
- ✅ 数据库连接成功
- ✅ 种子数据创建完成
- ✅ 开发服务器启动在 http://localhost:3000

## 🛠️ 可选：查看数据库

```bash
# 打开 Prisma Studio 查看数据
npm run db:studio
```

## ❓ 遇到问题？

### 常见问题解决：

1. **连接超时**
   - 检查网络连接
   - 确认连接字符串正确复制

2. **权限错误** 
   - 确认数据库用户有创建表的权限
   - 检查连接字符串中的用户名密码

3. **SSL 错误**
   - Neon 要求 SSL 连接，确保连接字符串包含 `?sslmode=require`

需要帮助？请告诉我具体遇到什么问题！