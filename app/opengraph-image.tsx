import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Kai 的摄影博客'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.72, marginBottom: 28 }}>Photography / Tech / Life</div>
        <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.08 }}>{siteName}</div>
        <div style={{ fontSize: 34, opacity: 0.82, marginTop: 32 }}>记录光影、技术和日常观察</div>
      </div>
    ),
    size
  )
}
