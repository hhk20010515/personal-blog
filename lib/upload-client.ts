import type { MediaFile } from '@/types/media'

interface SignResponse {
  configured: boolean
  cloudName?: string
  apiKey?: string
  signature?: string
  folder?: string
  public_id?: string
  timestamp?: number
}

async function readError(response: Response, fallback: string) {
  try {
    const data = await response.json()
    return data?.error?.message || data?.error || fallback
  } catch {
    return fallback
  }
}

/**
 * 上传一个文件并在媒体库中登记。
 * 配置了 Cloudinary 时，浏览器直接上传到 Cloudinary（不受 Vercel 4.5MB 限制），
 * 再把结果登记到数据库；未配置时退回本地上传（仅适合本地开发）。
 */
export async function uploadMediaFile(file: File): Promise<MediaFile> {
  const signResponse = await fetch('/api/upload/sign', { method: 'POST' })

  if (!signResponse.ok) {
    throw new Error(await readError(signResponse, '获取上传签名失败，请确认已登录'))
  }

  const sign: SignResponse = await signResponse.json()

  if (!sign.configured) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', { method: 'POST', body: formData })

    if (!response.ok) {
      throw new Error(await readError(response, `${file.name} 上传失败`))
    }

    return response.json()
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sign.apiKey!)
  formData.append('timestamp', String(sign.timestamp))
  formData.append('signature', sign.signature!)
  formData.append('folder', sign.folder!)
  formData.append('public_id', sign.public_id!)

  const cloudResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!cloudResponse.ok) {
    throw new Error(await readError(cloudResponse, `${file.name} 上传到 Cloudinary 失败`))
  }

  const cloud = await cloudResponse.json()

  const registerResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: cloud.secure_url,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: cloud.width,
      height: cloud.height,
    }),
  })

  if (!registerResponse.ok) {
    throw new Error(await readError(registerResponse, `${file.name} 登记到媒体库失败`))
  }

  return registerResponse.json()
}
