import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import PostContent from '@/components/posts/PostContent'
import PostHeader from '@/components/posts/PostHeader'
import PostComments from '@/components/posts/PostComments'
import PostSidebar from '@/components/posts/PostSidebar'
import RelatedPosts from '@/components/posts/RelatedPosts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PostPageProps {
  params: {
    slug: string
  }
}

function serializePost(post: any) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
	    updatedAt: post.updatedAt.toISOString(),
	    publishedAt: post.publishedAt?.toISOString() || null,
	    takenAt: post.takenAt?.toISOString() || null,
	    likeCount: post._count?.likes ?? post.likeCount,
    commentCount: post._count?.comments ?? post.commentCount,
    media: post.media.map((item: any) => ({
      ...item,
      media: {
        ...item.media,
        createdAt: item.media.createdAt?.toISOString?.() || item.media.createdAt,
        updatedAt: item.media.updatedAt?.toISOString?.() || item.media.updatedAt,
      },
    })),
  }
}

async function getPost(slug: string, includeUnpublished = false) {
  return prisma.post.findFirst({
    where: {
      slug,
      ...(includeUnpublished
        ? {}
        : {
            status: 'PUBLISHED',
            visibility: { in: ['PUBLIC', 'UNLISTED'] },
          }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          website: true,
          twitterHandle: true,
          githubHandle: true,
        },
      },
      category: true,
      tags: {
        include: { tag: true },
      },
      media: {
        orderBy: { order: 'asc' },
        include: { media: true },
      },
      _count: {
        select: {
          likes: true,
          comments: {
            where: {
              isApproved: true,
              isDeleted: false,
            },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.media[0]?.media.url ? [post.media[0].media.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.media[0]?.media.url ? [post.media[0].media.url] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const currentUser = await getCurrentUser()
  const post = await getPost(params.slug, currentUser?.role === 'ADMIN')

  if (!post) {
    notFound()
  }

  const requestHeaders = headers()
  const userAgent = requestHeaders.get('user-agent')
  const referer = requestHeaders.get('referer')
  const ipAddress = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  await prisma.$transaction([
    prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.pageView.create({
      data: {
        path: `/posts/${post.slug}`,
        userAgent,
        referer,
        ipAddress,
        userId: currentUser?.id,
      },
    }),
  ])

  const serializedPost = serializePost({
    ...post,
    viewCount: post.viewCount + 1,
  })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: serializedPost.title,
    description: serializedPost.excerpt,
    datePublished: serializedPost.publishedAt || serializedPost.createdAt,
    dateModified: serializedPost.updatedAt,
    author: {
      '@type': 'Person',
      name: serializedPost.author.name,
      image: serializedPost.author.image,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Luce',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/posts/${serializedPost.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <article className="min-h-screen bg-background">
        <PostHeader post={serializedPost} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <PostContent post={serializedPost} />
              <PostComments postId={serializedPost.id} />
            </div>

            <div className="lg:col-span-1">
              <PostSidebar post={serializedPost} />
            </div>
          </div>
        </div>

        <RelatedPosts
          currentPostId={serializedPost.id}
          categoryId={serializedPost.category?.id}
          tags={serializedPost.tags.map((item: any) => item.tag.id)}
        />
      </article>

      <Footer />
    </>
  )
}
