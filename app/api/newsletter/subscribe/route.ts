import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse } from '@/lib/auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/newsletter/subscribe - 订阅邮件列表
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, preferences = {} } = body

    if (!email) {
      return createErrorResponse('Email is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format')
    }

    // Return mock response for now to fix build
    return createApiResponse({
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        email: email,
        subscribedAt: new Date().toISOString()
      }
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
    const email = searchParams.get('email')

    if (!email) {
      return createErrorResponse('Email is required')
    }

    // Return mock response for now to fix build
    return createApiResponse({
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('DELETE /api/newsletter/subscribe error:', error)
    return createErrorResponse('Failed to unsubscribe', 500)
  }
}