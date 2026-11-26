import { v4 as uuidv4 } from 'uuid'
import { requireAuth, createApiResponse, createErrorResponse } from '@/lib/auth'
import { CLOUDINARY_FOLDER, getCloudinaryConfig, signCloudinaryParams } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/upload/sign - 生成浏览器直传 Cloudinary 所需的签名
// 文件不经过 Vercel 服务器，避免 4.5MB 请求体限制
export async function POST() {
  try {
    await requireAuth()
  } catch {
    return createErrorResponse('Unauthorized', 401)
  }

  const config = getCloudinaryConfig()

  if (!config) {
    return createApiResponse({ configured: false })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = uuidv4()
  const params = {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    timestamp,
  }

  return createApiResponse({
    configured: true,
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    signature: signCloudinaryParams(params, config.apiSecret),
    ...params,
  })
}
