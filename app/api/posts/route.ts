import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/posts - 获取文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    const featured = searchParams.get('featured') === 'true'
    const authorId = searchParams.get('authorId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category) {
      where.category = { slug: category }
    }
    
    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag }
        }
      }
    }
    
    if (status) {
      where.status = status
    } else {
      // Only show published posts for public API
      where.status = 'PUBLISHED'
      where.visibility = 'PUBLIC'
    }
    
    if (featured) {
      where.isFeatured = true
    }
    
    if (authorId) {
      where.authorId = authorId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
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
        },
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.post.count({ where })
    ])

    return createApiResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('GET /api/posts error:', error)
    return createErrorResponse('Failed to fetch posts', 500)
  }
}

// POST /api/posts - 创建新文章
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { 
      title, 
      content, 
      excerpt, 
      categoryId, 
      tags = [], 
      status = 'DRAFT',
      visibility = 'PUBLIC',
      isFeatured = false,
      isPinned = false,
      metaTitle,
      metaDescription
    } = body

    if (!title || !content) {
      return createErrorResponse('Title and content are required')
    }

    // Generate unique slug
    let baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 1

    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        visibility,
        isFeatured,
        isPinned,
        metaTitle,
        metaDescription,
        authorId: user.id,
        categoryId: categoryId || null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
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

    // Add tags if provided
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
          postId: post.id,
          tagId: tag.id
        })
      }
      
      await prisma.postTag.createMany({
        data: tagConnections
      })
    }

    // Fetch complete post with tags
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
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

    return createApiResponse(completePost, 201)

  } catch (error: any) {
    console.error('POST /api/posts error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to create post', 500)
  }
}