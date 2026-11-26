/**
 * 站点个人信息集中在这里修改。
 * 也可以用 .env / Vercel 环境变量覆盖（NEXT_PUBLIC_*），留空的链接不会显示。
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Luce',
  tagline: '胶片影像、器材笔记与技术观察。',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/hhk20010515',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  },
}
