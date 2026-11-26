import Link from 'next/link'
import StaticPage from '@/components/static/StaticPage'
import { siteConfig } from '@/lib/site'

export default function ContactPage() {
  const { contactEmail, social } = siteConfig
  const links = [
    { label: 'GitHub', href: social.github },
    { label: 'Instagram', href: social.instagram },
    { label: 'X / Twitter', href: social.twitter },
  ].filter((item) => item.href)

  return (
    <StaticPage
      title="联系"
      description="想聊胶片、器材、作品，或者有合作想法，都欢迎联系我。"
    >
      {contactEmail && (
        <p>
          邮箱：<a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      )}
      {links.length > 0 && (
        <p>
          {links.map((item, index) => (
            <span key={item.label}>
              {index > 0 && ' · '}
              <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
            </span>
          ))}
        </p>
      )}
      <p>
        也可以直接在 <Link href="/photography">作品</Link> 下面留言。
      </p>
    </StaticPage>
  )
}
