import { NextRequest } from 'next/server'
import { getCurrentUser, requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface RouteContext {
  params: {
    slug: string
  }
}

// GET /api/posts/[slug] - 获取单篇文章
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params
    const user = await getCurrentUser()
    
    // Build where clause based on user permissions
    const where: any = { slug }
    
    // If not authenticated or not admin, only show published public posts
    if (!user || user.role !== 'ADMIN') {
      where.status = 'PUBLISHED'
      where.visibility = { in: ['PUBLIC', 'UNLISTED'] }
    }

    const post = await prisma.post.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            website: true,
            twitterHandle: true,
            githubHandle: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        media: {
          include: {
            media: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: {
              where: {
                isApproved: true,
                isDeleted: false
              }
            }
          }
        }
      }
    })

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    // Increment view count (in background)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    // Don't wait for this to complete
    prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    }).catch(console.error)

    // Record page view for analytics
    prisma.pageView.create({
      data: {
        path: `/posts/${slug}`,
        userId: user?.id,
        ipAddress: clientIP,
        userAgent: req.headers.get('user-agent') || undefined,
        referer: req.headers.get('referer') || undefined,
      }
    }).catch(console.error)

    return createApiResponse(post)

  } catch (error) {
    console.error('GET /api/posts/[slug] error:', error)
    return createErrorResponse('Failed to fetch post', 500)
  }
}

// PUT /api/posts/[slug] - 更新文章
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { slug } = params
    const body = await req.json()
    
    const { 
      title, 
      content, 
      excerpt, 
      categoryId, 
      tags = [], 
      status,
      visibility,
      isFeatured,
      isPinned,
      metaTitle,
      metaDescription
    } = body

    // Find existing post
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!existingPost) {
      return createErrorResponse('Post not found', 404)
    }

    // Check permissions
    if (user.role !== 'ADMIN' && existingPost.authorId !== user.id) {
      return createErrorResponse('Permission denied', 403)
    }

    // Generate new slug if title changed
    let newSlug = slug
    if (title && title !== existingPost.title) {
      const baseSlug = slugify(title)
      newSlug = baseSlug
      let counter = 1

      while (await prisma.post.findFirst({ 
        where: { 
          slug: newSlug,
          id: { not: existingPost.id }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Update post
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (status !== undefined) {
      updateData.status = status
      // Set publishedAt when first published
      if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    }
    if (visibility !== undefined) updateData.visibility = visibility
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (newSlug !== slug) updateData.slug = newSlug

    const updatedPost = await prisma.post.update({
      where: { id: existingPost.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        category: true,
      }
    })

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tag connections
      await prisma.postTag.deleteMany({
        where: { postId: existingPost.id }
      })

      // Decrement count for old tags
      for (const oldTag of existingPost.tags) {
        await prisma.tag.update({
          where: { id: oldTag.tagId },
          data: { count: { decrement: 1 } }
        })
      }

      // Add new tags
      if (tags.length > 0) {
        const tagConnections = []
        
        for (const tagName of tags) {
          const tagSlug = slugify(tagName)
          
          // Find or create tag
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: { 
              count: { increment: 1 }
            },
            create: { 
              name: tagName, 
              slug: tagSlug,
              count: 1
            }
          })
          
          tagConnections.push({
            postId: existingPost.id,
            tagId: tag.id
          })
        }
        
        await prisma.postTag.createMany({
          data: tagConnections
        })
      }
    }

    // Fetch complete updated post
    const completePost = await prisma.post.findUnique({
      where: { id: existingPost.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return createApiResponse(completePost)

  } catch (error: any) {
    console.error('PUT /api/posts/[slug] error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to update post', 500)
  }
}

// DELETE /api/posts/[slug] - 删除文章
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { slug } = params

    // Find existing post
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!existingPost) {
      return createErrorResponse('Post not found', 404)
    }

    // Check permissions
    if (user.role !== 'ADMIN' && existingPost.authorId !== user.id) {
      return createErrorResponse('Permission denied', 403)
    }

    // Decrement tag counts
    for (const tagConnection of existingPost.tags) {
      await prisma.tag.update({
        where: { id: tagConnection.tagId },
        data: { count: { decrement: 1 } }
      })
    }

    // Delete post (cascading deletes will handle related records)
    await prisma.post.delete({
      where: { id: existingPost.id }
    })

    return createApiResponse({ message: 'Post deleted successfully' })

  } catch (error: any) {
    console.error('DELETE /api/posts/[slug] error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to delete post', 500)
  }
}