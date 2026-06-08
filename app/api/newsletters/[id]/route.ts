import { NextRequest } from 'next/server'
import { createApiResponse, createErrorResponse, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const newsletterStatuses = new Set(['DRAFT', 'SCHEDULED', 'SENT'])

interface RouteContext {
  params: {
    id: string
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()
    const body = await req.json()
    const status = body.status === undefined ? undefined : String(body.status).toUpperCase()

    if (status && !newsletterStatuses.has(status)) {
      return createErrorResponse('Invalid newsletter status')
    }

    const newsletter = await prisma.newsletterIssue.update({
      where: { id: params.id },
      data: {
        title: body.title === undefined ? undefined : String(body.title).trim(),
        subject: body.subject === undefined ? undefined : String(body.subject).trim(),
        content: body.content === undefined ? undefined : String(body.content).trim(),
        status: status as any,
        scheduledAt: body.scheduledAt === undefined ? undefined : body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    })

    return createApiResponse(newsletter)
  } catch (error) {
    console.error('PATCH /api/newsletters/[id] error:', error)
    return createErrorResponse('Failed to update newsletter', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()

    await prisma.newsletterIssue.delete({
      where: { id: params.id },
    })

    return createApiResponse({ message: 'Newsletter deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/newsletters/[id] error:', error)
    return createErrorResponse('Failed to delete newsletter', 500)
  }
}
