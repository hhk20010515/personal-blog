import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/users - 获取用户列表 (仅管理员)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50)
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const blocked = searchParams.get('blocked')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (blocked === 'true' || blocked === 'false') {
      where.isBlocked = blocked === 'true'
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          role: true,
          isBlocked: true,
          blockReason: true,
          blockedAt: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              followers: true,
              following: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return createApiResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('GET /api/users error:', error)
    return createErrorResponse('Failed to fetch users', 500)
  }
}

// PATCH /api/users - 批量操作用户 (仅管理员)
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { action, userIds, reason } = body

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return createErrorResponse('Action and userIds are required')
    }

    const results = await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          if (userId === admin.id && ['block', 'demote'].includes(action)) {
            return {
              userId,
              success: false,
              error: 'Cannot block or demote yourself',
            }
          }

          switch (action) {
            case 'block':
              await prisma.user.update({
                where: { id: userId },
                data: {
                  isBlocked: true,
                  blockReason: reason || '管理员封禁',
                  blockedAt: new Date(),
                  blockedById: admin.id,
                },
              })
              break
            case 'unblock':
              await prisma.user.update({
                where: { id: userId },
                data: {
                  isBlocked: false,
                  blockReason: null,
                  blockedAt: null,
                  blockedById: null,
                },
              })
              break
            case 'promote':
              await prisma.user.update({
                where: { id: userId },
                data: { role: 'ADMIN' },
              })
              break
            case 'demote':
              await prisma.user.update({
                where: { id: userId },
                data: { role: 'USER' },
              })
              break
            default:
              return {
                userId,
                success: false,
                error: 'Unknown action',
              }
          }

          return { userId, success: true }
        } catch (error: any) {
          return {
            userId,
            success: false,
            error: error.message,
          }
        }
      })
    )

    return createApiResponse({ results })

  } catch (error: any) {
    console.error('PATCH /api/users error:', error)
    return createErrorResponse('Failed to update users', 500)
  }
}
