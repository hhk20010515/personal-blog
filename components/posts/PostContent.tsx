'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Bookmark, Share2, ArrowUp, Cpu, Gauge, ShieldCheck, Weight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { markdownToSafeHtml } from '@/lib/markdown'

interface PostContentProps {
  post: {
    id: string
    title: string
    content: string
    slug: string
    likeCount: number
    gearBrand?: string | null
    gearModel?: string | null
    gearType?: string | null
    sensorFormat?: string | null
    megapixels?: number | null
    weightGrams?: number | null
    priceCny?: number | null
    reviewRating?: number | null
    dynamicRange?: string | null
    autofocusSystem?: string | null
    stabilization?: string | null
    weatherSealed?: boolean | null
    sampleVariation?: string | null
    firmwareVersion?: string | null
    media: Array<{
      media: {
        url: string
        alt?: string | null
        width?: number | null
        height?: number | null
      }
    }>
  }
}

export default function PostContent({ post }: PostContentProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Check if user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/posts/${post.slug}/like`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.liked)
          setLikeCount(data.likeCount)
        }
      } catch (error) {
        console.error('Failed to check like status:', error)
      }
    }

    checkLikeStatus()
  }, [session, post.slug])

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/posts/${post.slug}/bookmark`)
        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('Failed to check bookmark status:', error)
      }
    }

    checkBookmarkStatus()
  }, [session, post.slug])

  // Handle scroll to show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLike = async () => {
    if (!session?.user) {
      toast({
        title: '请先登录',
        description: '登录后即可点赞文章',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.slug}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikeCount(data.likeCount)
        
        toast({
          title: data.liked ? '点赞成功' : '取消点赞',
          description: data.liked ? '感谢你的支持！' : '已取消点赞'
        })
      } else {
        throw new Error('Like action failed')
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const handleBookmark = async () => {
    if (!session?.user) {
      toast({
        title: '请先登录',
        description: '登录后即可收藏文章',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.slug}/bookmark`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsBookmarked(data.bookmarked)
        toast({
          title: data.bookmarked ? '收藏成功' : '取消收藏',
          description: data.bookmarked ? '已添加到收藏' : '已从收藏中移除'
        })
      } else {
        throw new Error('Bookmark action failed')
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

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
        toast({
          title: '链接已复制',
          description: '分享链接已复制到剪贴板'
        })
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: '链接已复制',
        description: '分享链接已复制到剪贴板'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const gearParams = [
    { label: '品牌型号', value: [post.gearBrand, post.gearModel].filter(Boolean).join(' '), icon: Cpu },
    { label: '器材类型', value: post.gearType, icon: Cpu },
    { label: '传感器 / 规格', value: post.sensorFormat, icon: Gauge },
    { label: '有效像素', value: post.megapixels ? `${post.megapixels} MP` : null, icon: Gauge },
    { label: '重量', value: post.weightGrams ? `${post.weightGrams} g` : null, icon: Weight },
    { label: '参考价格', value: post.priceCny ? `¥${post.priceCny.toLocaleString('zh-CN')}` : null, icon: Weight },
    { label: '综合评分', value: post.reviewRating ? `${post.reviewRating.toFixed(1)} / 10` : null, icon: Gauge },
    { label: '动态范围', value: post.dynamicRange, icon: Gauge },
    { label: '对焦系统', value: post.autofocusSystem, icon: Cpu },
    { label: '防抖', value: post.stabilization, icon: ShieldCheck },
    { label: '防尘防滴', value: post.weatherSealed === null || post.weatherSealed === undefined ? null : post.weatherSealed ? '支持' : '不支持 / 未标注', icon: ShieldCheck },
    { label: '测试样本', value: post.sampleVariation, icon: Cpu },
    { label: '固件版本', value: post.firmwareVersion, icon: Cpu },
  ].filter((item) => item.value)

  return (
    <div className="relative">
      {/* Floating Action Bar */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="hidden lg:block fixed left-8 top-1/2 transform -translate-y-1/2 z-30"
      >
        <div className="glass-effect rounded-full p-2 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-12 w-12 rounded-full ${isLiked ? 'text-red-500' : ''}`}
          >
            <div className="flex flex-col items-center">
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1">{likeCount}</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`h-12 w-12 rounded-full ${isBookmarked ? 'text-primary' : ''}`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-12 w-12 rounded-full"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="prose prose-lg max-w-none"
      >
        {/* Featured Media */}
        {post.media.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.media.map((mediaItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-video rounded-xl overflow-hidden shadow-lg"
              >
                <Image
                  src={mediaItem.media.url}
                  alt={mediaItem.media.alt || `Media ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        )}

        {gearParams.length > 0 && (
          <div className="not-prose mb-10 border border-cyan-300/18 bg-[#05070c] p-5 text-white shadow-[0_24px_70px_rgba(0,229,255,0.08)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Gear review matrix</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">器材测评参数</h2>
              </div>
              {post.reviewRating && (
                <div className="border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-2 text-right">
                  <p className="text-xs text-cyan-100/55">Rating</p>
                  <p className="text-2xl font-semibold text-cyan-100">{post.reviewRating.toFixed(1)}</p>
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gearParams.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="border border-white/10 bg-white/[0.035] p-4">
                    <Icon className="mb-3 h-4 w-4 text-cyan-200" />
                    <p className="text-xs text-white/40">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{item.value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose-headings:gradient-text prose-headings:font-bold prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-code:bg-muted prose-code:text-foreground prose-pre:bg-muted prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ 
            __html: markdownToSafeHtml(post.content)
          }}
        />
      </motion.div>

      {/* Mobile Action Bar */}
      <div className="lg:hidden mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleBookmark}
            className={`flex items-center space-x-2 ${isBookmarked ? 'text-primary' : ''}`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>收藏</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-5 w-5" />
            <span>分享</span>
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-8 right-8 z-30"
        >
          <Button
            onClick={scrollToTop}
            size="sm"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
