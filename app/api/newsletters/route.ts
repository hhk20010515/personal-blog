import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50)
    const skip = (page - 1) * limit

    const [newsletters, total] = await Promise.all([
      prisma.newsletterIssue.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterIssue.count(),
    ])

    return createApiResponse({
      newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/newsletters error:', error)
    return createErrorResponse('Failed to fetch newsletters', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await req.json()
    const title = String(body.title || '').trim()
    const subject = String(body.subject || '').trim()
    const content = String(body.content || '').trim()

    if (!title || !subject || !content) {
      return createErrorResponse('Title, subject and content are required')
    }

    const newsletter = await prisma.newsletterIssue.create({
      data: {
        title,
        subject,
        content,
        status: body.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        createdById: user.id,
      },
    })

    return createApiResponse(newsletter, 201)
  } catch (error) {
    console.error('POST /api/newsletters error:', error)
    return createErrorResponse('Failed to create newsletter', 500)
  }
}
