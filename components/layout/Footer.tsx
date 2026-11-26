'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Instagram, Twitter, Mail, Film } from 'lucide-react'
import { siteConfig } from '@/lib/site'

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
    { name: '联系', href: '/contact' },
    { name: 'RSS订阅', href: '/rss' },
  ],
  legal: [
    { name: '隐私政策', href: '/privacy' },
    { name: '服务条款', href: '/terms' },
    { name: '版权声明', href: '/copyright' },
  ],
}

const socialLinks = [
  { name: 'GitHub', href: siteConfig.social.github, icon: Github },
  { name: 'Instagram', href: siteConfig.social.instagram, icon: Instagram },
  { name: 'X / Twitter', href: siteConfig.social.twitter, icon: Twitter },
  { name: 'Email', href: siteConfig.contactEmail ? `mailto:${siteConfig.contactEmail}` : '', icon: Mail },
].filter((item) => item.href)

const siteName = siteConfig.name

export default function Footer() {
  return (
    <footer className="border-t border-cyan-700/10 dark:border-cyan-300/10 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold gradient-text">{siteName}</span>
            </Link>
            <p className="text-foreground/60 mb-6 max-w-md leading-7">
              {siteConfig.tagline}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    aria-label={item.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center border border-foreground/10 bg-foreground/[0.04] text-foreground/50 backdrop-blur transition-all duration-200 hover:border-cyan-700/40 dark:hover:border-cyan-300/40 hover:bg-cyan-700/10 dark:hover:bg-cyan-300/10 hover:text-cyan-700 dark:hover:text-cyan-100"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-foreground">导航</h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-foreground/50 hover:text-cyan-700 dark:hover:text-cyan-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-foreground">支持</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-foreground/50 hover:text-cyan-700 dark:hover:text-cyan-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-sm text-foreground/50 mb-4 md:mb-0">
            <span>© {new Date().getFullYear()} {siteName}. 保留所有权利.</span>
          </div>

          <div className="flex items-center space-x-6">
            {navigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-foreground/50 hover:text-cyan-700 dark:hover:text-cyan-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Personal signature */}
        <div className="text-center mt-8 pt-8 border-t border-foreground/10">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-foreground/40">
            <Film className="h-4 w-4 text-amber-700 dark:text-amber-200" />
            <span>{siteConfig.signature}</span>
            {siteConfig.social.instagram && (
              <>
                <span aria-hidden>·</span>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cyan-700 dark:hover:text-cyan-100"
                >
                  {siteConfig.instagramHandle}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
