'use client'

import { motion } from 'framer-motion'
import { Aperture, Calendar, Camera, Clock, Coffee, Folder, MapPin, Share2, Tag, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface PostSidebarProps {
  post: {
    id: string
    title: string
    createdAt: string
    publishedAt?: string | null
    author: {
      id: string
      name: string | null
      image: string | null
      bio?: string | null
      website?: string | null
      twitterHandle?: string | null
      githubHandle?: string | null
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
	    camera?: string | null
	    lens?: string | null
	    focalLength?: string | null
	    aperture?: string | null
	    shutterSpeed?: string | null
	    iso?: number | null
	    takenAt?: string | null
	    locationName?: string | null
	    photoSeries?: string | null
	  }
	}

export default function PostSidebar({ post }: PostSidebarProps) {
  const readingTime = Math.ceil(post.title.length / 200) // Rough estimate
  const photoDetails = [
    { label: '相机', value: post.camera },
    { label: '镜头', value: post.lens },
    { label: '焦段', value: post.focalLength },
    { label: '光圈', value: post.aperture },
    { label: '快门', value: post.shutterSpeed },
    { label: 'ISO', value: post.iso ? String(post.iso) : null },
    { label: '拍摄时间', value: post.takenAt ? formatDate(post.takenAt) : null },
    { label: '地点', value: post.locationName },
    { label: '系列', value: post.photoSeries },
  ].filter((item) => item.value)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="space-y-6">
      {/* Author Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={post.author.image || ''} alt={post.author.name || 'Author'} />
            <AvatarFallback className="text-2xl">
              {post.author.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-lg mb-2">{post.author.name}</h3>
          
          {post.author.bio && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {post.author.bio}
            </p>
          )}

          <div className="flex items-center justify-center space-x-2">
            {post.author.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={post.author.website} target="_blank" rel="noopener noreferrer">
                  网站
                </a>
              </Button>
            )}
            {post.author.twitterHandle && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://twitter.com/${post.author.twitterHandle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </Button>
            )}
            {post.author.githubHandle && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://github.com/${post.author.githubHandle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Article Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          文章信息
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">发布时间</p>
              <p className="text-muted-foreground">
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">阅读时间</p>
              <p className="text-muted-foreground">{readingTime} 分钟</p>
            </div>
          </div>

          {post.category && (
            <div className="flex items-center text-sm">
              <Folder className="h-4 w-4 mr-3 text-muted-foreground" />
              <div>
                <p className="font-medium">分类</p>
                <Link
                  href={`/${post.category.slug}`}
                  className="text-primary hover:underline"
                >
                  {post.category.name}
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">作者</p>
              <p className="text-muted-foreground">{post.author.name}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Photography Metadata */}
      {photoDetails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            拍摄信息
          </h3>

          <div className="space-y-3">
            {photoDetails.map((detail) => (
              <div key={detail.label} className="flex items-start text-sm">
                {detail.label === '地点' ? (
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                ) : detail.label === '光圈' ? (
                  <Aperture className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                ) : (
                  <Camera className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{detail.label}</p>
                  <p className="text-muted-foreground">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            标签
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          分享文章
        </h3>
        
        <Button onClick={handleShare} className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          分享这篇文章
        </Button>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-xl p-6 text-center"
      >
        <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="font-semibold mb-2">喜欢这篇文章？</h3>
        <p className="text-sm text-muted-foreground mb-4">
          如果这篇文章对你有帮助，考虑请作者喝杯咖啡吧！
        </p>
        <Button variant="outline" className="w-full">
          <Coffee className="h-4 w-4 mr-2" />
          请作者喝咖啡
        </Button>
      </motion.div>

      {/* Table of Contents (if needed) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4">目录</h3>
        <nav className="space-y-2">
          <a href="#section-1" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            1. 引言
          </a>
          <a href="#section-2" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            2. 主要内容
          </a>
          <a href="#section-3" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            3. 总结
          </a>
        </nav>
      </motion.div>
    </div>
  )
}
