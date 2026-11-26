'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, Camera, Code2, Clock } from 'lucide-react'
import PhotoPlaceholder from '@/components/media/PhotoPlaceholder'
import { optimizedImage } from '@/lib/cloudinary-url'

interface FeaturedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  publishedAt: string | null
  camera?: string | null
  lens?: string | null
  focalLength?: string | null
  locationName?: string | null
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

const formatDate = (value: string | null, fallback: string) => {
  return new Date(value || fallback).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const estimateReadingTime = (text?: string | null) => {
  const count = text?.length || 600
  return Math.max(3, Math.ceil(count / 450))
}

export default function FeaturedPosts() {
  const [photographyPosts, setPhotographyPosts] = useState<FeaturedPost[]>([])
  const [techPosts, setTechPosts] = useState<FeaturedPost[]>([])
  const [latestPosts, setLatestPosts] = useState<FeaturedPost[]>([])

  useEffect(() => {
    const loadPosts = async () => {
      const [photoResponse, techResponse, latestResponse] = await Promise.all([
        fetch('/api/posts?category=photography&limit=4'),
        fetch('/api/posts?category=tech&limit=4'),
        fetch('/api/posts?limit=4'),
      ])

      if (photoResponse.ok) {
        const data = await photoResponse.json()
        setPhotographyPosts(data.posts || [])
      }

      if (techResponse.ok) {
        const data = await techResponse.json()
        setTechPosts(data.posts || [])
      }

      if (latestResponse.ok) {
        const data = await latestResponse.json()
        setLatestPosts(data.posts || [])
      }
    }

    loadPosts()
  }, [])

  const visualFrames = useMemo(() => {
    const fromPosts = photographyPosts
      .filter((post) => post.media[0]?.media.url)
      .slice(0, 3)
      .map((post) => ({
        src: optimizedImage(post.media[0].media.url, 1400),
        title: post.title,
        meta: [post.camera, post.lens, post.locationName].filter(Boolean).slice(0, 2).join(' / ') || 'Published work',
        slug: post.slug,
      }))

    return fromPosts
  }, [photographyPosts])

  const technologyList = techPosts.length ? techPosts : latestPosts

  return (
    <section className="bg-canvas text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-amber-700/70 dark:text-amber-100/70">
              <Camera className="h-4 w-4" />
              Curated Photography
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              让摄影作品像画廊一样被看见。
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-foreground/60 sm:text-base">
            首页的摄影内容以大图、留白、低干扰信息和更强的光影对比呈现；技术内容保持清晰结构，方便快速扫描标题、摘要和标签。
          </p>
        </motion.div>

        {visualFrames.length === 0 && (
          <div className="h-[420px] border border-foreground/10">
            <PhotoPlaceholder label="作品整理中" />
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.24fr_0.76fr]">
          {visualFrames[0] && (
            <motion.article
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              viewport={{ once: true }}
              className="group relative min-h-[420px] overflow-hidden border border-foreground/10 bg-foreground/5 sm:min-h-[540px]"
            >
              <FrameLink frame={visualFrames[0]} priority />
            </motion.article>
          )}

          <div className="grid gap-4">
            {visualFrames.slice(1, 3).map((frame, index) => (
              <motion.article
                key={frame.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group relative min-h-[260px] overflow-hidden border border-foreground/10 bg-foreground/5"
              >
                <FrameLink frame={frame} />
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/50">支持摄影分类、真实发布作品、器材信息与地点信息展示。</p>
          <Link
            href="/photography"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-100 transition hover:text-foreground"
          >
            查看完整摄影作品集
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="border-t border-foreground/10 bg-canvas-2">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-700/70 dark:text-cyan-100/70">
                <Code2 className="h-4 w-4" />
                Frontier Notes
              </div>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">前沿技术观察</h2>
            </div>
            <Link
              href="/tech"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 transition hover:text-cyan-700 dark:hover:text-cyan-100"
            >
              阅读技术文章
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {technologyList.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {technologyList.slice(0, 4).map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group block border border-foreground/10 bg-foreground/[0.035] p-6 transition duration-300 hover:border-cyan-700/30 dark:hover:border-cyan-100/30 hover:bg-cyan-700/[0.06] dark:hover:bg-cyan-100/[0.06]"
                  >
                    <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-foreground/50">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt, post.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {estimateReadingTime(post.excerpt)} min read
                      </span>
                      {post.category?.name && (
                        <span className="border border-foreground/10 px-2 py-1 text-foreground/60">{post.category.name}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold leading-snug tracking-normal text-foreground transition group-hover:text-cyan-700 dark:group-hover:text-cyan-100">
                      {post.title}
                    </h3>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-foreground/50">
                      {post.excerpt || '技术观察、工程实践与数字创作工具的持续记录。'}
                    </p>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="border border-foreground/10 bg-foreground/[0.035] p-8 text-sm text-foreground/50">
              暂无已发布文章。发布技术文章后，这里会自动展示最新内容。
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FrameLink({
  frame,
  priority = false,
}: {
  frame: { src: string; title: string; meta: string; slug?: string }
  priority?: boolean
}) {
  const content = (
    <>
      <img
        src={frame.src}
        alt={frame.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="dark absolute inset-x-0 bottom-0 p-6 text-foreground sm:p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-amber-700/70 dark:text-amber-100/70">{frame.meta}</p>
        <h3 className={priority ? 'max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl' : 'text-2xl font-semibold tracking-normal'}>
          {frame.title}
        </h3>
        {frame.slug && (
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 transition group-hover:text-foreground">
            打开作品
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </p>
        )}
      </div>
    </>
  )

  if (!frame.slug) {
    return <div className="absolute inset-0">{content}</div>
  }

  return (
    <Link href={`/posts/${frame.slug}`} className="absolute inset-0">
      {content}
    </Link>
  )
}
