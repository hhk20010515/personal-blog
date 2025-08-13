import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me - 获取当前用户信息
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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
            bookmarks: true
          }
        }
      }
    })

    return createApiResponse(fullUser)

  } catch (error: any) {
    console.error('GET /api/users/me error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to fetch user profile', 500)
  }
}

// PUT /api/users/me - 更新当前用户信息
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { 
      name, 
      bio, 
      website, 
      location, 
      twitterHandle, 
      githubHandle 
    } = body

    // Validate input
    const updateData: any = {}
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        return createErrorResponse('Invalid name')
      }
      updateData.name = name.trim() || null
    }
    
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return createErrorResponse('Bio too long (max 500 characters)')
      }
      updateData.bio = bio.trim() || null
    }
    
    if (website !== undefined) {
      if (typeof website !== 'string' || (website && !website.match(/^https?:\/\/.+/))) {
        return createErrorResponse('Invalid website URL')
      }
      updateData.website = website.trim() || null
    }
    
    if (location !== undefined) {
      if (typeof location !== 'string' || location.length > 100) {
        return createErrorResponse('Invalid location')
      }
      updateData.location = location.trim() || null
    }
    
    if (twitterHandle !== undefined) {
      if (typeof twitterHandle !== 'string' || (twitterHandle && !twitterHandle.match(/^[A-Za-z0-9_]{1,15}$/))) {
        return createErrorResponse('Invalid Twitter handle')
      }
      updateData.twitterHandle = twitterHandle.trim() || null
    }
    
    if (githubHandle !== undefined) {
      if (typeof githubHandle !== 'string' || (githubHandle && !githubHandle.match(/^[A-Za-z0-9_-]{1,39}$/))) {
        return createErrorResponse('Invalid GitHub handle')
      }
      updateData.githubHandle = githubHandle.trim() || null
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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
            bookmarks: true
          }
        }
      }
    })

    return createApiResponse(updatedUser)

  } catch (error: any) {
    console.error('PUT /api/users/me error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to update profile', 500)
  }
}