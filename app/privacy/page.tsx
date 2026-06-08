import StaticPage from '@/components/static/StaticPage'

export default function PrivacyPage() {
  return (
    <StaticPage
      title="隐私政策"
      description="说明网站收集和使用数据的基本方式。"
    >
      <p>
        网站可能会保存登录账户信息、评论、订阅邮箱和基础访问统计，用于提供内容管理、互动和安全能力。
      </p>
      <p>
        订阅邮箱仅用于发送博客更新通知。你可以随时通过退订链接或联系站长取消订阅。
      </p>
    </StaticPage>
  )
}
