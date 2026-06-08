import StaticPage from '@/components/static/StaticPage'

export default function TermsPage() {
  return (
    <StaticPage
      title="服务条款"
      description="使用本站时需要遵守的基本规则。"
    >
      <p>
        请不要发布违法、侵权、骚扰、垃圾广告或恶意内容。站长保留删除内容和限制账户访问的权利。
      </p>
      <p>
        网站内容仅代表作者个人观点，不构成专业建议。
      </p>
    </StaticPage>
  )
}
