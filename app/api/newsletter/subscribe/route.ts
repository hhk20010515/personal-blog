import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Create or update subscriber
    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {
        isActive: true,
        preferences: preferences || undefined
      },
      create: {
        email,
        isActive: true,
        preferences: preferences || undefined
      }
    })

    return createApiResponse({
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
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

    // Update subscriber to inactive
    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return createErrorResponse('Subscriber not found', 404)
    }

    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    })

    return createApiResponse({
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('DELETE /api/newsletter/subscribe error:', error)
    return createErrorResponse('Failed to unsubscribe', 500)
  }
}