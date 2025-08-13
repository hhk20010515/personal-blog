import { NextRequest } from 'next/server'
import { requireAdmin, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats - 获取管理后台统计数据
export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()

    // Get basic stats
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalComments,
      approvedComments,
      totalViews,
      totalLikes,
      totalMedia
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { isApproved: true, isDeleted: false } }),
      prisma.pageView.count(),
      prisma.like.count(),
      prisma.media.count()
    ])

    // Get recent activity
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: { where: { isApproved: true, isDeleted: false } }
          }
        }
      }
    })

    const recentComments = await prisma.comment.findMany({
      take: 5,
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        post: {
          select: { id: true, title: true, slug: true }
        }
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBlocked: true,
        createdAt: true
      }
    })

    // Get growth stats (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      newPostsLastMonth,
      newUsersLastMonth,
      newCommentsLastMonth,
      viewsLastMonth
    ] = await Promise.all([
      prisma.post.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.pageView.count({
        where: { viewedAt: { gte: thirtyDaysAgo } }
      })
    ])

    // Get popular posts (by views)
    const popularPosts = await prisma.post.findMany({
      take: 5,
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: { where: { isApproved: true, isDeleted: false } }
          }
        }
      }
    })

    // Get category distribution
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    })

    return createApiResponse({
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        totalComments,
        approvedComments,
        totalViews,
        totalLikes,
        totalMedia
      },
      growth: {
        newPostsLastMonth,
        newUsersLastMonth,
        newCommentsLastMonth,
        viewsLastMonth
      },
      recent: {
        posts: recentPosts,
        comments: recentComments,
        users: recentUsers
      },
      popular: {
        posts: popularPosts
      },
      categories: categoryStats
    })

  } catch (error: any) {
    console.error('GET /api/dashboard/stats error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Admin access required') {
      return createErrorResponse('Admin access required', 403)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to fetch dashboard stats', 500)
  }
}