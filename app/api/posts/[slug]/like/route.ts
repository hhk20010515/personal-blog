import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    slug: string
  }
}

// POST /api/posts/[slug]/like - 点赞/取消点赞文章
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { slug } = params

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, likeCount: true },
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    })

    const result = await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.like.delete({ where: { id: existingLike.id } })
        const updatedPost = await tx.post.update({
          where: { id: post.id },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        })

        return { liked: false, likeCount: Math.max(updatedPost.likeCount, 0) }
      }

      await tx.like.create({
        data: {
          userId: user.id,
          postId: post.id,
        },
      })

      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      })

      return { liked: true, likeCount: updatedPost.likeCount }
    })

    return createApiResponse(result)

  } catch (error: any) {
    console.error('POST /api/posts/[slug]/like error:', error)
    return createErrorResponse('Failed to toggle like', 500)
  }
}

// GET /api/posts/[slug]/like - 检查用户是否点赞了文章
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    const { slug } = params

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        likeCount: true,
        _count: {
          select: { likes: true },
        },
      },
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const existingLike = user
      ? await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId: post.id,
            },
          },
        })
      : null

    return createApiResponse({
      liked: Boolean(existingLike),
      likeCount: post._count.likes,
    })

  } catch (error: any) {
    console.error('GET /api/posts/[slug]/like error:', error)
    return createErrorResponse('Failed to check like status', 500)
  }
}
