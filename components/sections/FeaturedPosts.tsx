'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock data for featured posts
const featuredPosts = [
  {
    id: 1,
    title: 'React 19 新特性深度解析',
    excerpt: '探索 React 19 的最新功能，包括并发特性、Suspense 改进和性能优化技巧。',
    category: '技术',
    author: '博主',
    date: '2024-01-15',
    readTime: '8分钟',
    image: '/images/featured-1.jpg',
    slug: 'react-19-features'
  },
  {
    id: 2,
    title: '街头摄影的光影艺术',
    excerpt: '如何在城市中捕捉最美的光影瞬间，分享街头摄影的技巧和经验。',
    category: '摄影',
    author: '博主',
    date: '2024-01-12',
    readTime: '6分钟',
    image: '/images/featured-2.jpg',
    slug: 'street-photography-tips'
  },
  {
    id: 3,
    title: '远程工作的生活平衡之道',
    excerpt: '在家工作如何保持高效率的同时，也要维护好工作与生活的平衡。',
    category: '生活',
    author: '博主',
    date: '2024-01-10',
    readTime: '5分钟',
    image: '/images/featured-3.jpg',
    slug: 'remote-work-balance'
  }
]

export default function FeaturedPosts() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">精选文章</span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            最新的技术见解、摄影作品和生活感悟
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/posts/${post.slug}`}>
                <div className="glass-effect rounded-2xl overflow-hidden card-hover">
                  {/* Featured image placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-gray-900">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-foreground/60 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-foreground/70 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-foreground/60" />
                        <span className="text-sm text-foreground/60">{post.author}</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline">
            <Link href="/posts">
              查看所有文章
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}