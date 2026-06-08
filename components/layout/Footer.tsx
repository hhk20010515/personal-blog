'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Mail, Heart } from 'lucide-react'

const navigation = {
  main: [
    { name: '首页', href: '/' },
    { name: '摄影', href: '/photography' },
    { name: '器材测评', href: '/gear' },
    { name: '技术', href: '/tech' },
    { name: '文章', href: '/posts' },
    { name: '关于', href: '/about' },
  ],
  support: [
    { name: '联系我们', href: '/contact' },
    { name: '友情链接', href: '/links' },
    { name: 'RSS订阅', href: '/rss' },
  ],
  legal: [
    { name: '隐私政策', href: '/privacy' },
    { name: '服务条款', href: '/terms' },
    { name: '版权声明', href: '/copyright' },
  ],
}

const socialLinks = [
  {
    name: 'GitHub',
    href: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com',
    icon: Twitter,
  },
  {
    name: 'Email',
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com'}`,
    icon: Mail,
  },
]
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Luce'

export default function Footer() {
  return (
    <footer className="border-t border-cyan-300/10 bg-[#05070c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold gradient-text">{siteName}</span>
            </Link>
            <p className="text-white/60 mb-6 max-w-md leading-7">
              面向所有摄影爱好者的影像作品、器材测评与前沿技术观察平台。记录光线、参数、设备体验和数字创作方法。
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/[0.04] text-white/50 backdrop-blur transition-all duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">导航</h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-cyan-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">支持</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-cyan-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-sm text-white/50 mb-4 md:mb-0">
            <span>© {new Date().getFullYear()} {siteName}. 保留所有权利.</span>
          </div>

          <div className="flex items-center space-x-6">
            {navigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-white/50 hover:text-cyan-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Made with love */}
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="flex items-center justify-center text-sm text-white/40">
            用 <Heart className="h-4 w-4 mx-2 text-cyan-300" /> 和 Next.js 制作
          </p>
        </div>
      </div>
    </footer>
  )
}
