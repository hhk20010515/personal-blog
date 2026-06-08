import Link from 'next/link'
import StaticPage from '@/components/static/StaticPage'

export default function ExplorePage() {
  return (
    <StaticPage
      title="探索"
      description="从文章、摄影和分类开始浏览这个博客。"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Link className="rounded-lg border border-border p-5 hover:border-primary" href="/posts">所有文章</Link>
        <Link className="rounded-lg border border-border p-5 hover:border-primary" href="/photography">摄影</Link>
        <Link className="rounded-lg border border-border p-5 hover:border-primary" href="/categories">分类</Link>
      </div>
    </StaticPage>
  )
}
