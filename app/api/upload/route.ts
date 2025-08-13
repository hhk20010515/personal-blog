import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// This is a basic implementation. For production, you'd want to use a service like:
// - Uploadthing
// - Cloudinary
// - AWS S3
// - Vercel Blob

// POST /api/upload - 上传文件
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return createErrorResponse('No file provided')
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('File type not allowed')
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return createErrorResponse('File too large (max 10MB)')
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In a real implementation, you would:
    // 1. Upload to cloud storage (S3, Cloudinary, etc.)
    // 2. Generate thumbnails for images
    // 3. Extract video metadata
    // 4. Optimize images

    // For now, we'll simulate an upload
    const mockUploadUrl = `/uploads/${filename}`
    const mockThumbnailUrl = file.type.startsWith('image/') ? mockUploadUrl : null

    // Get image dimensions (basic implementation)
    let width = null
    let height = null
    
    if (file.type.startsWith('image/')) {
      // In production, use a library like sharp to get dimensions
      // This is a mock implementation
      width = 1920
      height = 1080
    }

    // Save file record to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        url: mockUploadUrl,
        thumbnailUrl: mockThumbnailUrl,
        uploadedBy: user.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return createApiResponse(media, 201)

  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Upload failed', 500)
  }
}

// GET /api/upload - 获取用户上传的文件列表
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'image' or 'video'

    const skip = (page - 1) * limit

    const where: any = {
      uploadedBy: user.id
    }

    if (type === 'image') {
      where.mimeType = {
        startsWith: 'image/'
      }
    } else if (type === 'video') {
      where.mimeType = {
        startsWith: 'video/'
      }
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.media.count({ where })
    ])

    return createApiResponse({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('GET /api/upload error:', error)
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message === 'Account blocked') {
      return createErrorResponse('Account is blocked', 403)
    }
    
    return createErrorResponse('Failed to fetch media', 500)
  }
}