# Google OAuth 配置指南

## 🎯 步骤说明

### 1. 前往 Google Cloud Console
1. 访问 https://console.cloud.google.com/
2. 登录您的 Google 账号
3. 创建新项目或选择现有项目

### 2. 启用 Google+ API
1. 在左侧菜单中，点击 **"API 和服务"** > **"库"**
2. 搜索 **"Google+ API"** 或 **"People API"**
3. 点击启用

### 3. 创建 OAuth 2.0 凭据
1. 在左侧菜单中，点击 **"API 和服务"** > **"凭据"**
2. 点击 **"创建凭据"** > **"OAuth 2.0 客户端 ID"**
3. 选择应用类型：**"Web 应用程序"**
4. 填写以下信息：
   - **名称**: `Personal Blog`
   - **已授权的 JavaScript 来源**:
     ```
     http://localhost:3000
     ```
   - **已授权的重定向 URI**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

### 4. 获取凭据信息
创建完成后，您会得到：
- **客户端 ID** (类似: `123456789-abc123.apps.googleusercontent.com`)
- **客户端密钥** (类似: `GOCSPX-abcd1234efgh5678ijkl`)

### 5. 更新环境变量
将获得的凭据添加到 `.env` 文件中：

```bash
# Google OAuth
GOOGLE_CLIENT_ID="您的客户端ID"
GOOGLE_CLIENT_SECRET="您的客户端密钥"
```

## 🚀 测试登录功能

配置完成后：
1. 重启开发服务器 (`npm run dev`)
2. 访问 http://localhost:3000
3. 点击登录按钮
4. 选择 Google 登录
5. 完成 OAuth 授权流程

## 📝 部署时的注意事项

部署到生产环境时，需要：
1. 在 Google Cloud Console 中添加生产环境的域名
2. 更新重定向 URI 为生产环境地址
3. 更新 NEXTAUTH_URL 环境变量