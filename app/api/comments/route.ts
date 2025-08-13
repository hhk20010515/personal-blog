import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/comments - 创建评论
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { content, postId, parentId } = body

    if (!content || !postId) {
      return createErrorResponse('Content and postId are required')
    }

    // Verify post exists and is published
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        status: 'PUBLISHED',
        visibility: { in: ['PUBLIC', 'UNLISTED'] }
      },
      select: { id: true, authorId: true, title: true, slug: true }
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    // If replying to a comment, verify parent exists
    let parentComment = null
    if (parentId) {
      parentComment = await prisma.comment.findFirst({
        where: {
          id: parentId,
          postId: postId,
          isDeleted: false
        },
        select: { id: true, authorId: true }
      })

      if (!parentComment) {
        return createErrorResponse('Parent comment not found', 404)
      }
    }

    // Create comment (auto-approve for now, can add moderation later)
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: user.id,
        isApproved: true // Auto-approve for now
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    })

    // Increment comment count on post
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    })

    // Create notifications
    try {
      // Notify post author if not self-comment
      if (post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT',
            title: '有人评论了你的文章',
            message: `${user.name} 评论了你的文章《${post.title}》`,
            userId: post.authorId,
            data: {
              postId: post.id,
              postSlug: post.slug,
              commentId: comment.id,
              commenterId: user.id,
              commenterName: user.name
            }
          }
        })
      }

      // Notify parent comment author if replying and not self-reply
      if (parentComment && parentComment.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT',
            title: '有人回复了你的评论',
            message: `${user.name} 回复了你的评论`,
            userId: parentComment.authorId,
            data: {
              postId: post.id,
              postSlug: post.slug,
              commentId: comment.id,
              parentCommentId: parentComment.id,
              replierId: user.id,
              replierName: user.name
            }
          }
        })
      }
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError)
      // Don't fail the request if notifications fail
    }

    return createApiResponse(comment, 201)

  } catch (error: any) {
    console.error('POST /api/comments error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to create comment', 500)
  }
}

// GET /api/comments - 获取评论列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!postId) {
      return createErrorResponse('postId is required')
    }

    const skip = (page - 1) * limit

    // Get root comments with replies
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only root comments
        isApproved: true,
        isDeleted: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        replies: {
          where: {
            isApproved: true,
            isDeleted: false
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            _count: {
              select: {
                likes: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            likes: true,
            replies: {
              where: {
                isApproved: true,
                isDeleted: false
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.comment.count({
      where: {
        postId,
        parentId: null,
        isApproved: true,
        isDeleted: false
      }
    })

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