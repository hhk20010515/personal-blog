/** Insert a Cloudinary transformation into a delivery URL (…/upload/<t>/…). Safe for client code. */
export function cloudinaryTransform(url: string, transformation: string) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url
  }

  return url.replace('/upload/', `/upload/${transformation}/`)
}

/** 按显示宽度生成压缩后的图片地址，避免直接加载几十 MB 的扫描原图 */
export function optimizedImage(url: string, width: number) {
  return cloudinaryTransform(url, `c_limit,w_${width},q_auto,f_auto`)
}
