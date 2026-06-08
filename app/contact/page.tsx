import StaticPage from '@/components/static/StaticPage'

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com'

  return (
    <StaticPage
      title="联系"
      description="如果你想交流摄影、技术或合作，可以通过邮箱联系我。"
    >
      <p>
        邮箱：<a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
      <p>
        你也可以在页脚配置真实的 GitHub、X/Twitter 和其他社交链接。
      </p>
    </StaticPage>
  )
}
