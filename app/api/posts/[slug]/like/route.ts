import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Find the post
    const post = await prisma.post.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
        visibility: { in: ['PUBLIC', 'UNLISTED'] }
      },
      select: { id: true, authorId: true }
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    })

    let liked = false

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      
      // Decrement like count
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: { decrement: 1 } }
      })
      
      liked = false
    } else {
      // Add like
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: post.id
        }
      })
      
      // Increment like count
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: { increment: 1 } }
      })
      
      liked = true

      // Create notification for post author (if not self-like)
      if (post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            title: '有人点赞了你的文章',
            message: `${user.name} 点赞了你的文章`,
            userId: post.authorId,
            data: {
              postId: post.id,
              postSlug: slug,
              likerId: user.id,
              likerName: user.name
            }
          }
        }).catch(console.error) // Don't fail the request if notification fails
      }
    }

    // Get updated like count
    const updatedPost = await prisma.post.findUnique({
      where: { id: post.id },
      select: { likeCount: true }
    })

    return createApiResponse({
      liked,
      likeCount: updatedPost?.likeCount || 0
    })

  } catch (error: any) {
    console.error('POST /api/posts/[slug]/like error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to toggle like', 500)
  }
}

// GET /api/posts/[slug]/like - 检查用户是否点赞了文章
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { slug } = params

    // Find the post
    const post = await prisma.post.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
        visibility: { in: ['PUBLIC', 'UNLISTED'] }
      },
      select: { id: true, likeCount: true }
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    // Check if user liked this post
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    })

    return createApiResponse({
      liked: !!like,
      likeCount: post.likeCount
    })

  } catch (error: any) {
    console.error('GET /api/posts/[slug]/like error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    
    return createErrorResponse('Failed to check like status', 500)
  }
}