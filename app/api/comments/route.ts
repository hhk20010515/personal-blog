import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/comments - 创建评论
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const content = String(body.content || '').trim()
    const postId = String(body.postId || '').trim()
    const parentId = body.parentId ? String(body.parentId).trim() : null

    if (!content || !postId) {
      return createErrorResponse('Content and postId are required')
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          content,
          postId,
          parentId,
          authorId: user.id,
          isApproved: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      })

      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      })

      return created
    })

    return createApiResponse(comment, 201)
  } catch (error: any) {
    console.error('POST /api/comments error:', error)
    return createErrorResponse('Failed to create comment', 500)
  }
}

// GET /api/comments - 获取评论列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50)
    const skip = (page - 1) * limit

    if (!postId) {
      await requireAdmin()
    }

    const where = {
      ...(postId ? { postId } : {}),
      isApproved: true,
      isDeleted: false,
      parentId: null,
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            where: {
              isApproved: true,
              isDeleted: false,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              replies: true,
              _count: {
                select: {
                  likes: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    return createApiResponse({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('GET /api/comments error:', error)
    return createErrorResponse('Failed to fetch comments', 500)
  }
}
