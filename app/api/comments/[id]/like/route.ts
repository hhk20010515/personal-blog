import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

// POST /api/comments/[id]/like - 点赞/取消点赞评论
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { id: commentId } = params

    // Find the comment
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        isApproved: true,
        isDeleted: false
      },
      select: { id: true, authorId: true }
    })

    if (!comment) {
      return createErrorResponse('Comment not found', 404)
    }

    // Check if user already liked this comment
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: comment.id
        }
      }
    })

    let liked = false

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      liked = false
    } else {
      // Add like
      await prisma.like.create({
        data: {
          userId: user.id,
          commentId: comment.id
        }
      })
      liked = true

      // Create notification for comment author (if not self-like)
      if (comment.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            title: '有人点赞了你的评论',
            message: `${user.name} 点赞了你的评论`,
            userId: comment.authorId,
            data: {
              commentId: comment.id,
              likerId: user.id,
              likerName: user.name
            }
          }
        }).catch(console.error) // Don't fail the request if notification fails
      }
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { commentId: comment.id }
    })

    return createApiResponse({
      liked,
      likeCount
    })

  } catch (error: any) {
    console.error('POST /api/comments/[id]/like error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to toggle like', 500)
  }
}

// GET /api/comments/[id]/like - 检查用户是否点赞了评论
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { id: commentId } = params

    // Find the comment
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        isApproved: true,
        isDeleted: false
      },
      select: { id: true }
    })

    if (!comment) {
      return createErrorResponse('Comment not found', 404)
    }

    // Check if user liked this comment
    const like = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: comment.id
        }
      }
    })

    const likeCount = await prisma.like.count({
      where: { commentId: comment.id }
    })

    return createApiResponse({
      liked: !!like,
      likeCount
    })

  } catch (error: any) {
    console.error('GET /api/comments/[id]/like error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    
    return createErrorResponse('Failed to check like status', 500)
  }
}