# 邮件服务配置指南

## 📧 Gmail SMTP 配置 (推荐)

### 1. 准备 Gmail 账号
1. 登录您的 Gmail 账号
2. 启用两步验证（必须）

### 2. 生成应用专用密码
1. 访问 https://myaccount.google.com/apppasswords
2. 选择应用：**"邮件"**
3. 选择设备：**"自定义"** → 输入 **"Personal Blog"**
4. 点击 **"生成"**
5. 复制生成的16位密码（格式: `abcd efgh ijkl mnop`）

### 3. 更新环境变量
在 `.env` 文件中配置：

```bash
# Email Service
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587" 
EMAIL_SERVER_USER="您的Gmail地址@gmail.com"
EMAIL_SERVER_PASSWORD="生成的应用专用密码"
EMAIL_FROM="您的Gmail地址@gmail.com"
```

## 🔧 其他邮件服务提供商

### Outlook/Hotmail
```bash
EMAIL_SERVER_HOST="smtp-mail.outlook.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="您的邮箱@outlook.com"
EMAIL_SERVER_PASSWORD="您的密码"
EMAIL_FROM="您的邮箱@outlook.com"
```

### QQ邮箱
```bash
EMAIL_SERVER_HOST="smtp.qq.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="您的QQ号@qq.com"
EMAIL_SERVER_PASSWORD="QQ邮箱授权码"
EMAIL_FROM="您的QQ号@qq.com"
```

## ✅ 测试邮件功能

配置完成后：
1. 重启开发服务器
2. 访问登录页面
3. 选择 **"使用邮箱登录"**
4. 输入邮箱地址
5. 检查邮箱中的验证链接

## 🛠️ 故障排除

### 常见问题：
1. **535 身份验证失败**
   - 确认已启用两步验证
   - 使用应用专用密码，不是账号密码

2. **连接超时**
   - 检查防火墙设置
   - 确认端口587未被阻塞

3. **邮件发送失败**
   - 检查 FROM 地址是否与认证邮箱一致
   - 确认 SMTP 配置正确