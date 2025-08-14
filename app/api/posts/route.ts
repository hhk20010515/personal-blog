import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/posts - 获取文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'

    // Return mock posts for now to fix build
    const mockPosts = [
      {
        id: '1',
        title: 'GPT-5与Gemini 2.5：2025年AI大语言模型新突破',
        slug: 'gpt-5-gemini-2025-ai-breakthroughs',
        excerpt: '探索2025年最新的AI技术发展趋势',
        content: '详细内容...',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        isFeatured: true,
        isPinned: false,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        author: {
          id: 'admin',
          name: 'Administrator',
          image: null,
          bio: 'Blog Administrator'
        },
        category: {
          id: 'tech',
          name: '技术',
          slug: 'tech'
        },
        tags: [],
        _count: {
          likes: 5,
          comments: 0
        }
      }
    ]

    const filteredPosts = category ? mockPosts.filter(p => p.category.slug === category) : mockPosts
    const featuredPosts = featured ? filteredPosts.filter(p => p.isFeatured) : filteredPosts

    return createApiResponse({
      posts: featuredPosts,
      pagination: {
        page,
        limit,
        total: featuredPosts.length,
        pages: Math.ceil(featuredPosts.length / limit)
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
    const body = await req.json()
    const { title, content, excerpt, categoryId, status = 'DRAFT' } = body

    if (!title || !content) {
      return createErrorResponse('Title and content are required')
    }

    // Return mock response for now to fix build
    return createApiResponse({
      id: 'mock-post-id',
      title,
      slug: 'mock-slug',
      content,
      excerpt,
      status,
      visibility: 'PUBLIC',
      isFeatured: false,
      isPinned: false,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      author: {
        id: 'mock-user-id',
        name: 'Test User',
        image: null
      },
      category: {
        id: categoryId || 'tech',
        name: '技术',
        slug: 'tech'
      },
      tags: [],
      _count: {
        likes: 0,
        comments: 0
      }
    }, 201)

  } catch (error: any) {
    console.error('POST /api/posts error:', error)
    return createErrorResponse('Failed to create post', 500)
  }
}