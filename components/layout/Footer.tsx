'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Mail, Heart } from 'lucide-react'

const navigation = {
  main: [
    { name: '首页', href: '/' },
    { name: '技术', href: '/tech' },
    { name: '摄影', href: '/photography' },
    { name: '生活', href: '/life' },
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
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客'

export default function Footer() {
  return (
    <footer className="bg-muted/20 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold gradient-text">{siteName}</span>
            </Link>
            <p className="text-foreground/70 mb-6 max-w-md">
              分享计算机技术、摄影艺术和生活感悟的个人博客平台。
              与志同道合的朋友一起探索、学习、成长。
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
                    className="w-10 h-10 bg-background/50 backdrop-blur rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6">导航</h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">支持</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-sm text-foreground/60 mb-4 md:mb-0">
            <span>© {new Date().getFullYear()} Kai 的摄影博客. 保留所有权利.</span>
          </div>

          <div className="flex items-center space-x-6">
            {navigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Made with love */}
        <div className="text-center mt-8 pt-8 border-t border-border/40">
          <p className="flex items-center justify-center text-sm text-foreground/60">
            用 <Heart className="h-4 w-4 mx-2 text-red-500" /> 和 Next.js 制作
          </p>
        </div>
      </div>
    </footer>
  )
}
