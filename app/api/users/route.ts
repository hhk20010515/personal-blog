import { NextRequest } from 'next/server'
import { requireAdmin, getCurrentUser, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users - 获取用户列表 (仅管理员)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const role = searchParams.get('role') as 'USER' | 'ADMIN'
    const blocked = searchParams.get('blocked') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (blocked !== undefined) {
      where.isBlocked = blocked
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
              following: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
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
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Admin access required') {
      return createErrorResponse('Admin access required', 403)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
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

    const results = []

    for (const userId of userIds) {
      try {
        // Don't allow admin to modify themselves
        if (userId === admin.id) {
          results.push({
            userId,
            success: false,
            error: 'Cannot modify your own account'
          })
          continue
        }

        switch (action) {
          case 'block':
            if (!reason) {
              results.push({
                userId,
                success: false,
                error: 'Block reason is required'
              })
              continue
            }
            
            await prisma.user.update({
              where: { id: userId },
              data: {
                isBlocked: true,
                blockReason: reason,
                blockedAt: new Date(),
                blockedBy: {
                  connect: { id: admin.id }
                }
              }
            })
            
            results.push({ userId, success: true })
            break

          case 'unblock':
            await prisma.user.update({
              where: { id: userId },
              data: {
                isBlocked: false,
                blockReason: null,
                blockedAt: null,
                blockedBy: {
                  disconnect: true
                }
              }
            })
            
            results.push({ userId, success: true })
            break

          case 'promote':
            await prisma.user.update({
              where: { id: userId },
              data: { role: 'ADMIN' }
            })
            
            results.push({ userId, success: true })
            break

          case 'demote':
            await prisma.user.update({
              where: { id: userId },
              data: { role: 'USER' }
            })
            
            results.push({ userId, success: true })
            break

          default:
            results.push({
              userId,
              success: false,
              error: 'Invalid action'
            })
        }
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: 'Operation failed'
        })
      }
    }

    return createApiResponse({ results })

  } catch (error: any) {
    console.error('PATCH /api/users error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Admin access required') {
      return createErrorResponse('Admin access required', 403)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to update users', 500)
  }
}