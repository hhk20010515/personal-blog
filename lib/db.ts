import { prisma } from './prisma'
import type { Post, User, Category, Tag, Comment, PostStatus, Visibility } from '@prisma/client'

// User utilities
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'USER') {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}

export async function blockUser(userId: string, reason: string, blockedBy: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
      blockReason: reason,
      blockedAt: new Date(),
      blockedBy: {
        connect: { id: blockedBy }
      },
    },
  })
}

export async function unblockUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
      blockReason: null,
      blockedAt: null,
      blockedBy: {
        disconnect: true
      },
    },
  })
}

// Post utilities
export async function getPostBySlug(slug: string, includeUnpublished = false) {
  const whereClause: any = { slug }
  
  if (!includeUnpublished) {
    whereClause.status = 'PUBLISHED'
    whereClause.visibility = 'PUBLIC'
  }

  return prisma.post.findUnique({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      media: {
        include: {
          media: true,
        },
        orderBy: {
          order: 'asc',
        },
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
}

export async function getPostsWithPagination({
  page = 1,
  limit = 10,
  categorySlug,
  tagSlug,
  authorId,
  featured,
  includeUnpublished = false,
}: {
  page?: number
  limit?: number
  categorySlug?: string
  tagSlug?: string
  authorId?: string
  featured?: boolean
  includeUnpublished?: boolean
}) {
  const skip = (page - 1) * limit
  const whereClause: any = {}

  if (!includeUnpublished) {
    whereClause.status = 'PUBLISHED'
    whereClause.visibility = 'PUBLIC'
  }

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    }
  }

  if (tagSlug) {
    whereClause.tags = {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    }
  }

  if (authorId) {
    whereClause.authorId = authorId
  }

  if (featured !== undefined) {
    whereClause.isFeatured = featured
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
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
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.post.count({ where: whereClause }),
  ])

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function incrementPostViews(postId: string, userId?: string, ipAddress?: string) {
  // Update post view count
  await prisma.post.update({
    where: { id: postId },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  })

  // Record page view for analytics
  await prisma.pageView.create({
    data: {
      path: `/posts/${postId}`,
      userId,
      ipAddress,
      viewedAt: new Date(),
    },
  })
}

// Category utilities
export async function getCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
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
    orderBy: {
      sortOrder: 'asc',
    },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
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
  })
}

// Tag utilities
export async function getPopularTags(limit = 20) {
  return prisma.tag.findMany({
    orderBy: {
      count: 'desc',
    },
    take: limit,
  })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
  })
}

// Comment utilities
export async function getCommentsForPost(postId: string) {
  return prisma.comment.findMany({
    where: {
      postId,
      isApproved: true,
      isDeleted: false,
      parentId: null, // Only root comments, replies are nested
    },
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
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function approveComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { isApproved: true },
  })
}

export async function deleteComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  })
}

// Analytics utilities
export async function getDashboardStats() {
  const [
    totalPosts,
    publishedPosts,
    totalUsers,
    totalComments,
    totalViews,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
    prisma.comment.count({ where: { isApproved: true, isDeleted: false } }),
    prisma.pageView.count(),
  ])

  return {
    totalPosts,
    publishedPosts,
    totalUsers,
    totalComments,
    totalViews,
  }
}

export async function getPopularPosts(limit = 10) {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    orderBy: {
      viewCount: 'desc',
    },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
  })
}