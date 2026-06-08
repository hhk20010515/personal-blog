import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/users/me - 获取当前用户信息
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth()
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        twitterHandle: true,
        githubHandle: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    })

    return createApiResponse(user)

  } catch (error: any) {
    console.error('GET /api/users/me error:', error)
    return createErrorResponse('Failed to fetch user profile', 500)
  }
}

// PUT /api/users/me - 更新当前用户信息
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { name, bio, website, location, twitterHandle, githubHandle } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        location: location?.trim() || null,
        twitterHandle: twitterHandle?.trim() || null,
        githubHandle: githubHandle?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        twitterHandle: true,
        githubHandle: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    })

    return createApiResponse(updatedUser)

  } catch (error: any) {
    console.error('PUT /api/users/me error:', error)
    return createErrorResponse('Failed to update profile', 500)
  }
}
