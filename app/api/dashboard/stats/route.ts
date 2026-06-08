import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/dashboard/stats - 获取管理后台统计数据
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalComments,
      approvedComments,
      totalViews,
      totalLikes,
      totalMedia,
      newPostsLastMonth,
      newUsersLastMonth,
      newCommentsLastMonth,
      viewsLastMonth,
      recentPosts,
      recentComments,
      recentUsers,
      popularPosts,
      categories,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.comment.count({ where: { isApproved: true, isDeleted: false } }),
      prisma.pageView.count(),
      prisma.like.count({ where: { postId: { not: null } } }),
      prisma.media.count(),
      prisma.post.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.comment.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.pageView.count({ where: { viewedAt: { gte: monthStart } } }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.comment.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          author: { select: { id: true, name: true, image: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isBlocked: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
        orderBy: { viewCount: 'desc' },
        take: 5,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  status: 'PUBLISHED',
                  visibility: 'PUBLIC',
                },
              },
            },
          },
        },
      }),
    ])

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
      categories
    })

  } catch (error: any) {
    console.error('GET /api/dashboard/stats error:', error)
    return createErrorResponse('Failed to fetch dashboard stats', 500)
  }
}
