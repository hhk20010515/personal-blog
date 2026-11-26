import { NextRequest } from 'next/server'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import { cloudinaryTransform, getCloudinaryConfig, isOwnCloudinaryUrl } from '@/lib/cloudinary'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

const uploaderSelect = {
  uploader: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
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
  }
}

// 浏览器已直传到 Cloudinary，这里只把结果登记到媒体库
async function registerCloudinaryUpload(req: NextRequest, userId: string) {
  const config = getCloudinaryConfig()

  if (!config) {
    return createErrorResponse('Cloudinary 未配置', 400)
  }

  const body = await req.json()
  const url = typeof body.url === 'string' ? body.url : ''
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : ''

  if (!isOwnCloudinaryUrl(url, config.cloudName)) {
    return createErrorResponse('Invalid media url')
  }

  if (!allowedTypes.includes(mimeType)) {
    return createErrorResponse('File type not allowed')
  }

  const originalName = String(body.originalName || 'upload').slice(0, 255)
  const filename = url.split('/').pop() || originalName
  const isImage = mimeType.startsWith('image/')

  const media = await prisma.media.create({
    data: {
      filename,
      originalName,
      mimeType,
      size: Number(body.size) || 0,
      width: Number.isFinite(body.width) ? Math.round(body.width) : null,
      height: Number.isFinite(body.height) ? Math.round(body.height) : null,
      url,
      thumbnailUrl: isImage ? cloudinaryTransform(url, 'c_limit,w_1200,q_auto,f_auto') : null,
      uploadedBy: userId,
    },
    include: uploaderSelect,
  })

  return createApiResponse(media, 201)
}

// POST /api/upload - 上传文件（本地开发）或登记 Cloudinary 直传结果
export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      return await registerCloudinaryUpload(req, user.id)
    }

    // 线上（Vercel）文件系统是只读、临时的，本地存储会丢失
    if (process.env.VERCEL) {
      return createErrorResponse('线上环境需要先配置 Cloudinary 才能上传文件', 503)
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return createErrorResponse('No file provided')
    }

    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('File type not allowed')
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return createErrorResponse('File too large (max 50MB)')
    }

    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    const uploaded = await uploadToLocalPublic(file, filename)

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        uploadedBy: user.id,
      },
      include: uploaderSelect,
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
