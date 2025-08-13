# Cloudinary 文件上传配置

## 🖼️ 为什么选择 Cloudinary？

- **免费额度**: 25GB 存储，25GB 月流量
- **自动优化**: 图片自动压缩和格式转换  
- **CDN 加速**: 全球 CDN 分发
- **强大 API**: 图片处理、滤镜、裁剪等

## 🚀 配置步骤

### 1. 注册 Cloudinary 账号
1. 访问 https://cloudinary.com/
2. 点击 **"Sign up for free"**
3. 填写注册信息或使用 Google/GitHub 登录

### 2. 获取 API 凭据
1. 登录后进入 Dashboard
2. 在 **"Account Details"** 部分找到：
   - **Cloud name** (例如: `your-cloud-name`)
   - **API Key** (例如: `123456789012345`)
   - **API Secret** (例如: `abcdefghijklmnopqrstuvwxyz123456`)

### 3. 更新环境变量
在 `.env` 文件中配置：

```bash
# Cloudinary (图片和媒体文件存储)
CLOUDINARY_CLOUD_NAME="您的cloud-name"
CLOUDINARY_API_KEY="您的api-key"
CLOUDINARY_API_SECRET="您的api-secret"
```

## 📂 上传文件夹配置

推荐在 Cloudinary 中创建以下文件夹结构：
- `blog/posts/` - 文章图片
- `blog/avatars/` - 用户头像  
- `blog/media/` - 其他媒体文件

## ✅ 测试上传功能

配置完成后：
1. 重启开发服务器
2. 登录网站
3. 访问 **"写文章"** 页面
4. 尝试上传图片
5. 检查 Cloudinary Dashboard 中是否有文件

## 🛡️ 安全设置

### 上传预设 (Upload Presets)
1. 在 Cloudinary Console 中，进入 **"Settings"** > **"Upload"**  
2. 创建 **"Unsigned upload preset"**:
   - **Preset name**: `blog_uploads`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `blog/`
   - **Resource type**: `Auto`
   - **Access control**: 设置适当权限

## 💡 高级功能

### 自动图片优化
```javascript
// 自动格式转换和质量优化
const optimizedUrl = cloudinary.url('sample.jpg', {
  fetch_format: 'auto',
  quality: 'auto'
})
```

### 响应式图片
```javascript
// 根据设备自动调整尺寸
const responsiveUrl = cloudinary.url('sample.jpg', {
  width: 'auto',
  dpr: 'auto',
  crop: 'scale'
})
```