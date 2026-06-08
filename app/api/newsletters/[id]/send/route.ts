import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { sendNewsletterEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()

    const newsletter = await prisma.newsletterIssue.findUnique({
      where: { id: params.id },
    })

    if (!newsletter) {
      return createErrorResponse('Newsletter not found', 404)
    }

    if (newsletter.status === 'SENT') {
      return createErrorResponse('Newsletter has already been sent')
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    })

    if (subscribers.length === 0) {
      return createErrorResponse('No active subscribers')
    }

    const results = await Promise.allSettled(
      subscribers.map((subscriber) =>
        sendNewsletterEmail({
          to: subscriber.email,
          subject: newsletter.subject,
          content: newsletter.content,
        })
      )
    )

    const sentCount = results.filter((result) => result.status === 'fulfilled').length

    if (sentCount === 0) {
      const firstError = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined
      throw firstError?.reason || new Error('Newsletter send failed')
    }

    const updatedNewsletter = await prisma.newsletterIssue.update({
      where: { id: newsletter.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        recipients: sentCount,
      },
    })

    return createApiResponse({
      newsletter: updatedNewsletter,
      sentCount,
      failedCount: subscribers.length - sentCount,
    })
  } catch (error: any) {
    console.error('POST /api/newsletters/[id]/send error:', error)
    return createErrorResponse(error.message || 'Failed to send newsletter', 500)
  }
}
