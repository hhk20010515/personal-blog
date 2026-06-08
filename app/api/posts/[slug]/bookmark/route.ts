import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    slug: string
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        _count: {
          select: { bookmarks: true },
        },
      },
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const bookmark = user
      ? await prisma.bookmark.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId: post.id,
            },
          },
        })
      : null

    return createApiResponse({
      bookmarked: Boolean(bookmark),
      bookmarkCount: post._count.bookmarks,
    })
  } catch (error) {
    console.error('GET /api/posts/[slug]/bookmark error:', error)
    return createErrorResponse('Failed to check bookmark status', 500)
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    })

    const result = await prisma.$transaction(async (tx) => {
      if (existingBookmark) {
        await tx.bookmark.delete({ where: { id: existingBookmark.id } })
        const bookmarkCount = await tx.bookmark.count({ where: { postId: post.id } })
        return { bookmarked: false, bookmarkCount }
      }

      await tx.bookmark.create({
        data: {
          userId: user.id,
          postId: post.id,
        },
      })

      const bookmarkCount = await tx.bookmark.count({ where: { postId: post.id } })
      return { bookmarked: true, bookmarkCount }
    })

    return createApiResponse(result)
  } catch (error) {
    console.error('POST /api/posts/[slug]/bookmark error:', error)
    return createErrorResponse('Failed to toggle bookmark', 500)
  }
}
