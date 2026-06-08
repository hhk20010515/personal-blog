import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    id: string
  }
}

// POST /api/comments/[id]/like - 点赞/取消点赞评论
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { id } = params

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!comment) {
      return createErrorResponse('Comment not found', 404)
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: id,
        },
      },
    })

    const result = await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.like.delete({ where: { id: existingLike.id } })
        const likeCount = await tx.like.count({ where: { commentId: id } })
        return { liked: false, likeCount }
      }

      await tx.like.create({
        data: {
          userId: user.id,
          commentId: id,
        },
      })

      const likeCount = await tx.like.count({ where: { commentId: id } })
      return { liked: true, likeCount }
    })

    return createApiResponse(result)
  } catch (error: any) {
    console.error('POST /api/comments/[id]/like error:', error)
    return createErrorResponse('Failed to toggle like', 500)
  }
}

// GET /api/comments/[id]/like - 检查用户是否点赞了评论
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { likes: true },
        },
      },
    })

    if (!comment) {
      return createErrorResponse('Comment not found', 404)
    }

    const existingLike = user
      ? await prisma.like.findUnique({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId: id,
            },
          },
        })
      : null

    return createApiResponse({
      liked: Boolean(existingLike),
      likeCount: comment._count.likes,
    })
  } catch (error: any) {
    console.error('GET /api/comments/[id]/like error:', error)
    return createErrorResponse('Failed to check like status', 500)
  }
}
