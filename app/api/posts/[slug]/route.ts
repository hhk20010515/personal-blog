import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildPhotographyUpdateData } from '@/lib/post-metadata'
import { slugify } from '@/lib/utils'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    slug: string
  }
}

// GET /api/posts/[slug] - 获取单篇文章
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params

    const currentUser = await getCurrentUser()
    const canSeeUnpublished = currentUser?.role === 'ADMIN'

    const post = await prisma.post.findFirst({
      where: {
        slug,
        ...(canSeeUnpublished
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

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const userAgent = req.headers.get('user-agent')
    const referer = req.headers.get('referer')
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

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

    return createApiResponse({
      ...post,
      viewCount: post.viewCount + 1,
    })

  } catch (error) {
    console.error('GET /api/posts/[slug] error:', error)
    return createErrorResponse('Failed to fetch post', 500)
  }
}

// PUT /api/posts/[slug] - 更新文章
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()

    const { slug } = params
    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      status,
      visibility,
      categoryId,
      tags,
      isFeatured,
      isPinned,
      metaTitle,
      metaDescription,
    } = body

    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, status: true, publishedAt: true },
    })

    if (!existingPost) {
      return createErrorResponse('Post not found', 404)
    }

    const tagNames = Array.isArray(tags)
      ? tags.map((tag: string) => String(tag).trim()).filter(Boolean)
      : null

    const post = await prisma.$transaction(async (tx) => {
      if (tagNames) {
        await tx.postTag.deleteMany({ where: { postId: existingPost.id } })
      }

      return tx.post.update({
        where: { id: existingPost.id },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(content ? { content } : {}),
          excerpt: excerpt === undefined ? undefined : excerpt?.trim() || null,
          status: status || undefined,
          visibility: visibility || undefined,
          categoryId: categoryId === undefined ? undefined : categoryId || null,
          isFeatured: isFeatured === undefined ? undefined : Boolean(isFeatured),
          isPinned: isPinned === undefined ? undefined : Boolean(isPinned),
          metaTitle: metaTitle === undefined ? undefined : metaTitle?.trim() || null,
          metaDescription: metaDescription === undefined ? undefined : metaDescription?.trim() || null,
          ...buildPhotographyUpdateData(body),
          publishedAt:
            status === 'PUBLISHED' && !existingPost.publishedAt
              ? new Date()
              : status === 'DRAFT'
                ? null
                : undefined,
          tags: tagNames
            ? {
                create: tagNames.map((name: string) => {
                  const tagSlug = slugify(name) || name.toLowerCase()

                  return {
                    tag: {
                      connectOrCreate: {
                        where: { slug: tagSlug },
                        create: {
                          name,
                          slug: tagSlug,
                        },
                      },
                    },
                  }
                }),
              }
            : undefined,
        },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      })
    })

    return createApiResponse(post)

  } catch (error: any) {
    console.error('PUT /api/posts/[slug] error:', error)
    return createErrorResponse('Failed to update post', 500)
  }
}

// DELETE /api/posts/[slug] - 删除文章
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()

    const { slug } = params

    await prisma.post.delete({
      where: { slug },
    })

    return createApiResponse({ message: 'Post deleted successfully' })

  } catch (error: any) {
    console.error('DELETE /api/posts/[slug] error:', error)
    return createErrorResponse('Failed to delete post', 500)
  }
}
