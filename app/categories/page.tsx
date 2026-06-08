import Link from 'next/link'
import StaticPage from '@/components/static/StaticPage'
import { prisma } from '@/lib/prisma'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
            },
          },
        },
      },
    },
  })

  return (
    <StaticPage
      title="分类"
      description="按主题浏览所有已发布内容。"
    >
      <div className="grid gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/posts?category=${category.slug}`}
            className="block rounded-lg border border-border bg-background/60 p-5 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground mt-1">{category.description}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{category._count.posts} 篇</span>
            </div>
          </Link>
        ))}
      </div>
    </StaticPage>
  )
}
