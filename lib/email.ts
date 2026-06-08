import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isEmailConfigured() {
  return Boolean(
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_PORT &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD &&
    process.env.EMAIL_FROM
  )
}

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string
  url: string
  provider: any
}) {
  const { host } = new URL(url)
  
  const result = await transporter.sendMail({
    to: email,
    from: provider.from,
    subject: `登录到 ${host}`,
    text: text({ url, host }),
    html: html({ url, host, email }),
  })
  
  const failed = result.rejected.concat(result.pending).filter(Boolean)
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
  }
}

function html({ url, host, email }: { url: string; host: string; email: string }) {
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
  const escapedHost = `${host.replace(/\./g, '&#8203;.')}`
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客'
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>登录到 ${escapedHost}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 32px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 32px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-1px);
    }
    .footer {
      font-size: 14px;
      color: #9ca3af;
      line-height: 1.5;
    }
    .email {
      color: #6b7280;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">${siteName}</div>
      <h1 class="title">登录链接</h1>
      <p class="subtitle">
        点击下面的按钮登录到您的账户：<br>
        <span class="email">${escapedEmail}</span>
      </p>
      <a href="${url}" class="button">立即登录</a>
      <p class="footer">
        如果您没有请求此邮件，可以安全地忽略它。<br>
        此链接将在 24 小时后过期。
      </p>
    </div>
  </div>
</body>
</html>
`
}

function text({ url, host }: { url: string; host: string }) {
  return `登录到 ${host}\n\n点击此链接登录：\n${url}\n\n如果您没有请求此邮件，可以安全地忽略它。`
}

export async function sendNewsletterEmail({
  to,
  subject,
  content,
}: {
  to: string
  subject: string
  content: string
}) {
  if (!isEmailConfigured()) {
    throw new Error('Email service is not configured')
  }

  const siteName = escapeHtml(process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客')
  const safeSubject = escapeHtml(subject)
  const safeContent = escapeHtml(content)

  await transporter.sendMail({
    to,
    from: process.env.EMAIL_FROM,
    subject,
    text: content,
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:14px;padding:36px;box-shadow:0 10px 30px rgba(15,23,42,.08);">
      <div style="font-size:22px;font-weight:700;margin-bottom:24px;color:#2563eb;">${siteName}</div>
      <h1 style="font-size:28px;line-height:1.25;margin:0 0 20px;color:#0f172a;">${safeSubject}</h1>
      <div style="font-size:16px;line-height:1.75;color:#334155;white-space:pre-wrap;">${safeContent}</div>
      <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin-top:32px;">
        你收到这封邮件是因为你订阅了本站更新。
      </p>
    </div>
  </div>
</body>
</html>
`,
  })
}
