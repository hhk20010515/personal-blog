'use client'

import { motion } from 'framer-motion'
import { Calendar, User, Eye, Heart, MessageCircle, Share2, Clock, Tag } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

interface PostHeaderProps {
  post: {
    id: string
    title: string
    excerpt?: string | null
    createdAt: string
    publishedAt?: string | null
    viewCount: number
    likeCount: number
    commentCount: number
    author: {
      id: string
      name: string | null
      image: string | null
      bio?: string | null
    }
    category?: {
      id: string
      name: string
      slug: string
      color?: string | null
    } | null
    tags: Array<{
      tag: {
        id: string
        name: string
        slug: string
      }
    }>
    media: Array<{
      media: {
        url: string
        alt?: string | null
      }
    }>
  }
}

export default function PostHeader({ post }: PostHeaderProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <header className="relative overflow-hidden">
      {/* Hero Background */}
      {post.media[0] && (
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${post.media[0].media.url})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      )}

      <div className={`relative z-10 ${post.media[0] ? 'text-white' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Category */}
            {post.category && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6"
              >
                <Link
                  href={`/${post.category.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-colors"
                  style={{ 
                    backgroundColor: post.category.color ? `${post.category.color}20` : undefined,
                    borderColor: post.category.color ? `${post.category.color}40` : undefined 
                  }}
                >
                  {post.category.name}
                </Link>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt */}
            {post.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${
                  post.media[0] ? 'text-white/90' : 'text-foreground/80'
                }`}
              >
                {post.excerpt}
              </motion.p>
            )}

            {/* Meta Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8"
            >
              {/* Author */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.image || ''} alt={post.author.name || 'Author'} />
                  <AvatarFallback>
                    {post.author.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold">{post.author.name}</p>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentCount}</span>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className={post.media[0] ? 'border-white/30 hover:bg-white/10' : ''}
              >
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </motion.div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2 mt-8"
              >
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      post.media[0] 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-20 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-purple-400/20 blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-400/20 to-red-400/20 blur-xl"
        />
      </div>
    </header>
  )
}