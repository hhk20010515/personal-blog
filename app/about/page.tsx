import StaticPage from '@/components/static/StaticPage'

export default function AboutPage() {
  return (
    <StaticPage
      title="关于"
      description="这里记录我对摄影、技术和日常生活的观察。"
    >
      <p>
        这个博客的核心是摄影作品和创作记录，也会穿插技术实践、工具折腾和生活片段。
      </p>
      <p>
        后续可以在这里补充个人经历、常用器材、摄影理念、合作方式和长期项目介绍。
      </p>
    </StaticPage>
  )
}
