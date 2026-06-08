import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客'
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: {
      category: true,
    },
  })

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/posts/${post.slug}`

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
          ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ''}
          <description>${escapeXml(post.excerpt || '')}</description>
        </item>
      `
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(siteName)}</title>
        <link>${siteUrl}</link>
        <description>摄影、技术与生活记录</description>
        <language>zh-CN</language>
        ${items}
      </channel>
    </rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
