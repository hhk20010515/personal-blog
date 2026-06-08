import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/categories - 获取分类列表
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
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
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return createApiResponse(categories)

  } catch (error) {
    console.error('GET /api/categories error:', error)
    return createErrorResponse('Failed to fetch categories', 500)
  }
}

// POST /api/categories - 创建新分类 (仅管理员)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const name = String(body.name || '').trim()

    if (!name) {
      return createErrorResponse('Category name is required')
    }

    const slug = slugify(body.slug || name)
    if (!slug) {
      return createErrorResponse('Category slug is required')
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || 'Folder',
        color: body.color?.trim() || '#6B7280',
        isActive: body.isActive ?? true,
        sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 99,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return createApiResponse(category, 201)

  } catch (error: any) {
    console.error('POST /api/categories error:', error)
    return createErrorResponse('Failed to create category', 500)
  }
}

// PUT /api/categories - 批量更新分类排序 (仅管理员)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const categoriesInput = Array.isArray(body.categories) ? body.categories : []

    await prisma.$transaction(
      categoriesInput.map((category: any, index: number) =>
        prisma.category.update({
          where: { id: category.id },
          data: {
            sortOrder: Number.isFinite(category.sortOrder) ? category.sortOrder : index,
            isActive: category.isActive ?? true,
          },
        })
      )
    )

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return createApiResponse(categories)

  } catch (error: any) {
    console.error('PUT /api/categories error:', error)
    return createErrorResponse('Failed to update categories', 500)
  }
}
