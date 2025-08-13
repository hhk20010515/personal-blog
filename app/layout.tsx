import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Personal Blog - 分享技术与生活的见解',
    template: '%s | Personal Blog'
  },
  description: '一个专注于分享计算机技术、摄影艺术和生活见解的个人博客平台',
  keywords: ['博客', '技术', '摄影', '个人见解', 'Next.js', 'React'],
  authors: [{ name: 'Blog Author' }],
  creator: 'Blog Author',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://yourdomain.com',
    siteName: 'Personal Blog',
    title: 'Personal Blog - 分享技术与生活的见解',
    description: '一个专注于分享计算机技术、摄影艺术和生活见解的个人博客平台',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Personal Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Blog - 分享技术与生活的见解',
    description: '一个专注于分享计算机技术、摄影艺术和生活见解的个人博客平台',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}