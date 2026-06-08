import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, getCurrentUser, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/newsletter/subscribe - 获取订阅者列表 (仅管理员)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim().toLowerCase()
    const currentUser = await getCurrentUser()

    if (email) {
      const canReadSubscriber =
        currentUser?.role === 'ADMIN' || currentUser?.email?.toLowerCase() === email

      if (!canReadSubscriber) {
        return createErrorResponse('Unauthorized', 401)
      }

      const subscriber = await prisma.subscriber.findUnique({
        where: { email },
      })

      return createApiResponse({ subscriber })
    }

    await requireAdmin()

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100)
    const skip = (page - 1) * limit

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscriber.count(),
    ])

    return createApiResponse({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/newsletter/subscribe error:', error)
    return createErrorResponse('Failed to fetch subscribers', 500)
  }
}

// POST /api/newsletter/subscribe - 订阅邮件列表
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, preferences = {} } = body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail) {
      return createErrorResponse('Email is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return createErrorResponse('Invalid email format')
    }

    const subscriber = await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        isActive: true,
        preferences,
      },
      create: {
        email: normalizedEmail,
        preferences,
      },
    })

    return createApiResponse({
      message: 'Successfully subscribed to newsletter',
      subscriber
    }, 201)

  } catch (error) {
    console.error('POST /api/newsletter/subscribe error:', error)
    return createErrorResponse('Failed to subscribe', 500)
  }
}

// DELETE /api/newsletter/subscribe - 取消订阅
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!email) {
      return createErrorResponse('Email is required')
    }

    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false },
    })

    return createApiResponse({
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('DELETE /api/newsletter/subscribe error:', error)
    return createErrorResponse('Failed to unsubscribe', 500)
  }
}
