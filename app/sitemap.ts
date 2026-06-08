import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const staticRoutes = ['', '/posts', '/photography', '/tech', '/life', '/about', '/contact', '/categories'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }))

  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    return [
      ...staticRoutes,
      ...posts.map((post) => ({
        url: `${siteUrl}/posts/${post.slug}`,
        lastModified: post.updatedAt,
      })),
    ]
  } catch {
    return staticRoutes
  }
}
