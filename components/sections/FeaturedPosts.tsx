'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeaturedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  publishedAt: string | null
  category: {
    name: string
  } | null
  author: {
    name: string | null
  }
  media: Array<{
    media: {
      url: string
      alt?: string | null
    }
  }>
}

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])

  useEffect(() => {
    const loadFeaturedPosts = async () => {
      const featuredResponse = await fetch('/api/posts?featured=true&limit=3')

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        if (featuredData.posts.length > 0) {
          setFeaturedPosts(featuredData.posts)
          return
        }
      }

      const latestResponse = await fetch('/api/posts?limit=3')
      if (latestResponse.ok) {
        const latestData = await latestResponse.json()
        setFeaturedPosts(latestData.posts)
      }
    }

    loadFeaturedPosts()
  }, [])

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

        {featuredPosts.length > 0 ? (
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
                  <div className="glass-effect rounded-2xl overflow-hidden card-hover h-full">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                      {post.media[0]?.media.url && (
                        <img
                          src={post.media[0].media.url}
                          alt={post.media[0].media.alt || post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {post.category && (
                        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-gray-900">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-foreground/60 mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-foreground/70 mb-4 line-clamp-3">
                        {post.excerpt || '暂无摘要'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-foreground/60" />
                          <span className="text-sm text-foreground/60">{post.author.name || '作者'}</span>
                        </div>

                        <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground mb-12">
            暂无已发布文章
          </div>
        )}

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
