import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildPhotographyCreateData } from '@/lib/post-metadata'
import { slugify } from '@/lib/utils'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

async function createUniqueSlug(title: string) {
  const baseSlug = slugify(title) || `post-${Date.now()}`
  let slug = baseSlug
  let suffix = 1

  while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

// GET /api/posts - 获取文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)
    const skip = (page - 1) * limit

    const category = searchParams.get('category')
    const categoryId = searchParams.get('categoryId')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const exclude = searchParams.get('exclude')
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'
    const featuredParam = searchParams.get('featured')
    const currentUser = await getCurrentUser()
    const canSeeUnpublished = currentUser?.role === 'ADMIN'

    const where: any = {}

    if (!includeUnpublished || !canSeeUnpublished) {
      where.status = 'PUBLISHED'
      where.visibility = 'PUBLIC'
    } else if (status && status !== 'all') {
      where.status = status
    }

    if (category) {
      where.category = { slug: category.toLowerCase() }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag.toLowerCase(),
          },
        },
      }
    }

    if (featuredParam === 'true') {
      where.isFeatured = true
    }

    if (exclude) {
      where.id = { not: exclude }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        {
          tags: {
            some: {
              tag: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
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
            },
          },
          category: true,
          tags: {
            include: { tag: true },
          },
          media: {
            orderBy: { order: 'asc' },
            include: { media: true },
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
      prisma.post.count({ where }),
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
    const user = await requireAdmin()
    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      categoryId,
      status = 'DRAFT',
      visibility = 'PUBLIC',
      tags = [],
      isFeatured = false,
      metaTitle,
      metaDescription,
    } = body

    if (!title || !content) {
      return createErrorResponse('Title and content are required')
    }

    const slug = await createUniqueSlug(title)
    const tagNames = Array.isArray(tags)
      ? tags.map((tag: string) => String(tag).trim()).filter(Boolean)
      : []

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || null,
        status,
        visibility,
        isFeatured: Boolean(isFeatured),
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        ...buildPhotographyCreateData(body),
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: user.id,
        categoryId: categoryId || null,
        tags: {
          create: tagNames.map((name: string) => {
            const tagSlug = slugify(name) || name.toLowerCase()

            return {
              tag: {
                connectOrCreate: {
                  where: { slug: tagSlug },
                  create: {
                    name,
                    slug: tagSlug,
                  },
                },
              },
            }
          }),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        category: true,
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })

    return createApiResponse(post, 201)

  } catch (error: any) {
    console.error('POST /api/posts error:', error)
    return createErrorResponse('Failed to create post', 500)
  }
}
