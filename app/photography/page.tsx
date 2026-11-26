'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Aperture, Camera, Film, MapPin, Plus, Timer } from 'lucide-react'
import PhotoPlaceholder from '@/components/media/PhotoPlaceholder'
import { optimizedImage } from '@/lib/cloudinary-url'

interface PhotographyPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  createdAt: string
  camera?: string | null
  lens?: string | null
  focalLength?: string | null
  aperture?: string | null
  shutterSpeed?: string | null
  iso?: number | null
  takenAt?: string | null
  locationName?: string | null
  photoSeries?: string | null
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

export default function PhotographyPage() {
  const [latestPosts, setLatestPosts] = useState<PhotographyPost[]>([])
  const [loaded, setLoaded] = useState(false)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    const loadLatestPhotography = async () => {
      try {
        const response = await fetch('/api/posts?category=photography&limit=24')
        if (!response.ok) return

        const data = await response.json()
        setLatestPosts(data.posts || [])
      } finally {
        setLoaded(true)
      }
    }

    loadLatestPhotography()
  }, [])

  const frames = useMemo(() => {
    const publishedFrames = latestPosts
      .filter((post) => post.media[0]?.media.url)
      .slice(0, 4)
      .map((post) => ({
        src: optimizedImage(post.media[0].media.url, 2000),
        title: post.title,
        label: post.photoSeries || 'Published work',
        meta: [post.camera, post.focalLength, post.locationName].filter(Boolean).slice(0, 2).join(' / ') || formatDate(post.publishedAt, post.createdAt),
        slug: post.slug,
      }))

    return publishedFrames
  }, [latestPosts])

  // 摄影方向：按文章里填写的「系列」自动分组，封面取该系列最新一张
  const collections = useMemo(() => {
    const bySeries = new Map<string, { title: string; count: number; image?: string; slug: string }>()

    for (const post of latestPosts) {
      const series = post.photoSeries?.trim()
      if (!series) continue

      const existing = bySeries.get(series)
      if (existing) {
        existing.count += 1
        existing.image ||= post.media[0]?.media.url
      } else {
        bySeries.set(series, { title: series, count: 1, image: post.media[0]?.media.url, slug: post.slug })
      }
    }

    return Array.from(bySeries.values()).slice(0, 6)
  }, [latestPosts])

  const visibleLatestPosts = latestPosts.slice(0, 9)

  const getPhotoMeta = (post: PhotographyPost) => {
    return [post.camera, post.lens, post.focalLength, post.aperture, post.locationName]
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-foreground">
        <section className="dark relative min-h-[92vh] overflow-hidden text-foreground">
          <div className="absolute inset-0">
            {frames[0] ? (
              <img
                src={frames[0].src}
                alt={frames[0].title}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoPlaceholder />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.9),rgba(8,8,7,0.42),rgba(8,8,7,0.08))]" />
            <div className="hero-fade hero-fade-lg absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75 }}
                className="max-w-4xl"
              >
                <div className="mb-6 inline-flex items-center gap-3 border border-foreground/20 bg-foreground/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-foreground/75 backdrop-blur-md">
                  <Film className="h-4 w-4 text-amber-700 dark:text-amber-100" />
                  Photography Portfolio
                </div>
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
                  影像不是装饰，
                  <span className="block text-foreground/70">是观察方式。</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
                  以现场光线、空间秩序和色彩情绪为线索，记录摄影作品、器材参数、后期思路与视觉系统。
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#gallery"
                    className="group inline-flex items-center justify-center gap-3 bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-amber-700 dark:hover:bg-amber-100"
                  >
                    浏览作品
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/write"
                      className="group inline-flex items-center justify-center gap-3 border border-foreground/20 bg-foreground/[0.08] px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-md transition hover:bg-foreground/[0.14]"
                    >
                      发布新作品
                      <Plus className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.div>

              {frames[0] && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.12 }}
                className="hidden border border-foreground/10 bg-foreground/10 p-5 backdrop-blur-md lg:block"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-foreground/50">
                  <span>Featured frame</span>
                  <Aperture className="h-4 w-4 text-foreground/60" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {frames.slice(1, 4).map((frame) => (
                    <div key={frame.slug} className="aspect-[3/4] overflow-hidden bg-foreground/5">
                      <img src={frame.src} alt={frame.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-2xl font-semibold leading-tight">{frames[0].title}</p>
                <p className="mt-2 text-sm text-foreground/50">{frames[0].meta}</p>
              </motion.div>
              )}
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-700/60 dark:text-amber-100/60">Selected Works</p>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">精选摄影作品</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-foreground/50">
              大图优先，减少信息噪音；悬停时只显示必要的作品标题、系列和拍摄信息。
            </p>
          </div>

          {loaded && frames.length === 0 && (
            <div className="h-[360px] border border-foreground/10">
              <PhotoPlaceholder label={isAdmin ? '在「写文章」里选择摄影分类并添加图片，作品会出现在这里' : '作品整理中，敬请期待'} />
            </div>
          )}

          <div className="grid auto-rows-[260px] gap-4 md:grid-cols-2 lg:grid-cols-4">
            {frames.map((frame, index) => (
              <motion.article
                key={frame.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden border border-foreground/10 bg-foreground/5 ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                } ${index === 3 ? 'lg:col-span-2' : ''}`}
              >
                <PortfolioFrame frame={frame} large={index === 0} />
              </motion.article>
            ))}
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className="border-y border-foreground/10 bg-canvas-2">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.28em] text-cyan-700/60 dark:text-cyan-100/60">Published Notes</p>
                  <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">最近发布的摄影记录</h2>
                </div>
                <Link
                  href="/posts?category=photography"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 transition hover:text-foreground"
                >
                  查看全部
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibleLatestPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/posts/${post.slug}`} className="block h-full border border-foreground/10 bg-foreground/[0.035] transition duration-300 hover:border-amber-700/30 dark:hover:border-amber-100/30 hover:bg-foreground/[0.06]">
                      <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
                        {post.media[0]?.media.url ? (
                          <img
                            src={optimizedImage(post.media[0].media.url, 900)}
                            alt={post.media[0].media.alt || post.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(103,232,249,0.12))]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-foreground/40">
                          <span className="inline-flex items-center gap-1.5">
                            <Timer className="h-3.5 w-3.5" />
                            {formatDate(post.publishedAt, post.createdAt)}
                          </span>
                          {post.locationName && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {post.locationName}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold leading-snug tracking-normal transition group-hover:text-amber-700 dark:group-hover:text-amber-100">
                          {post.title}
                        </h3>
                        {getPhotoMeta(post) && (
                          <p className="mt-3 line-clamp-1 text-xs uppercase tracking-[0.16em] text-cyan-700/60 dark:text-cyan-100/60">
                            {getPhotoMeta(post)}
                          </p>
                        )}
                        {post.excerpt && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-foreground/50">{post.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {collections.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mb-10">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-foreground/40">Collections</p>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">作品系列</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {collections.map((collection, index) => (
                <motion.div
                  key={collection.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                  viewport={{ once: true }}
                  className="group relative min-h-[360px] overflow-hidden border border-foreground/10 bg-foreground/5"
                >
                  <Link href={`/posts?category=photography&q=${encodeURIComponent(collection.title)}`} className="absolute inset-0">
                    {collection.image ? (
                      <img
                        src={optimizedImage(collection.image, 900)}
                        alt={collection.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <PhotoPlaceholder />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="dark absolute bottom-0 p-6 text-foreground">
                      <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/50">
                        <Camera className="h-3.5 w-3.5" />
                        {collection.count} 组作品
                      </p>
                      <h3 className="text-2xl font-semibold">{collection.title}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

function PortfolioFrame({
  frame,
  large = false,
}: {
  frame: { src: string; title: string; label: string; meta: string; slug?: string }
  large?: boolean
}) {
  const content = (
    <>
      <img
        src={frame.src}
        alt={frame.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
      <div className="dark absolute inset-x-0 bottom-0 p-5 text-foreground sm:p-7">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-amber-700/60 dark:text-amber-100/60">{frame.label}</p>
        <h3 className={large ? 'max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl' : 'text-2xl font-semibold tracking-normal'}>
          {frame.title}
        </h3>
        <p className="mt-3 text-sm text-foreground/50">{frame.meta}</p>
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
