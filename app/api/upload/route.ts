import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function uploadToCloudinary(file: File, publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'personal-blog'
  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex')
  const formData = new FormData()

  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)
  formData.append('public_id', publicId)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Cloudinary upload failed')
  }

  const data = await response.json()

  return {
    url: data.secure_url as string,
    thumbnailUrl: data.secure_url as string,
    width: data.width as number | undefined,
    height: data.height as number | undefined,
  }
}

async function uploadToLocalPublic(file: File, filename: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  const url = `/uploads/${filename}`

  return {
    url,
    thumbnailUrl: file.type.startsWith('image/') ? url : null,
    width: null,
    height: null,
  }
}

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
    const publicId = filename.replace(/\.[^.]+$/, '')
    const uploaded = (await uploadToCloudinary(file, publicId)) || (await uploadToLocalPublic(file, filename))

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width: uploaded.width,
        height: uploaded.height,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        uploadedBy: user.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return createApiResponse(media, 201)

  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    return createErrorResponse('Upload failed', 500)
  }
}

// GET /api/upload - 获取用户上传的文件列表
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50)
    const skip = (page - 1) * limit
    const type = searchParams.get('type')

    const where = {
      ...(user.role === 'ADMIN' ? {} : { uploadedBy: user.id }),
      ...(type === 'image' ? { mimeType: { startsWith: 'image/' } } : {}),
      ...(type === 'video' ? { mimeType: { startsWith: 'video/' } } : {}),
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
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
    return createErrorResponse('Failed to fetch media', 500)
  }
}

// DELETE /api/upload?id=mediaId - 删除媒体文件
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Media id is required')
    }

    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        id: true,
        uploadedBy: true,
        url: true,
      },
    })

    if (!media) {
      return createErrorResponse('Media not found', 404)
    }

    if (user.role !== 'ADMIN' && media.uploadedBy !== user.id) {
      return createErrorResponse('Forbidden', 403)
    }

    await prisma.media.delete({
      where: { id: media.id },
    })

    if (media.url.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', media.url)
      await fs.unlink(localPath).catch(() => undefined)
    }

    return createApiResponse({ message: 'Media deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/upload error:', error)
    return createErrorResponse('Failed to delete media', 500)
  }
}
