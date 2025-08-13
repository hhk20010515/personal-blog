'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  viewCount: number
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  category: {
    id: string
    name: string
    slug: string
  } | null
}

interface RelatedPostsProps {
  currentPostId: string
  categoryId?: string
  tags: string[]
}

export default function RelatedPosts({ currentPostId, categoryId, tags }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRelatedPosts = async () => {
      try {
        // Build query parameters for related posts
        const params = new URLSearchParams({
          limit: '6',
          exclude: currentPostId
        })
        
        if (categoryId) {
          params.append('categoryId', categoryId)
        }

        const response = await fetch(`/api/posts?${params}`)
        if (response.ok) {
          const data = await response.json()
          setRelatedPosts(data.posts.slice(0, 3)) // Only show 3 related posts
        }
      } catch (error) {
        console.error('Failed to load related posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRelatedPosts()
  }, [currentPostId, categoryId])

  if (loading) {
    return (
      <section className="py-16 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">相关文章</h2>
          <p className="text-muted-foreground">你可能也会感兴趣的内容</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/posts/${post.slug}`}>
                <div className="glass-effect rounded-xl overflow-hidden card-hover h-full">
                  {/* Placeholder for featured image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category badge */}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-gray-900">
                          {post.category.name}
                        </span>
                      </div>
                    )}

                    {/* View count */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{post.viewCount}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Meta info */}
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.author.name}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read more link */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary font-medium">
                        阅读更多
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* View all posts link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" size="lg">
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