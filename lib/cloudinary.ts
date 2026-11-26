import crypto from 'crypto'
export { cloudinaryTransform } from '@/lib/cloudinary-url'

export const CLOUDINARY_FOLDER = 'personal-blog'

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  return { cloudName, apiKey, apiSecret }
}

/**
 * Cloudinary signed-upload signature: params sorted alphabetically,
 * joined as key=value&..., with the API secret appended, then SHA-1.
 */
export function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const base = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return crypto.createHash('sha1').update(base + apiSecret).digest('hex')
}

export function isOwnCloudinaryUrl(url: string, cloudName: string) {
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/`)
}
