'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Aperture, Camera, Film, MapPin, Plus, Timer } from 'lucide-react'

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

const galleryFrames = [
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=86',
    title: 'Silent Valley',
    label: 'Landscape',
    meta: 'Morning light / 35mm',
  },
  {
    src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=86',
    title: 'Urban Index',
    label: 'Street',
    meta: 'Night geometry',
  },
  {
    src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=86',
    title: 'Blue Hour',
    label: 'City',
    meta: 'Long exposure',
  },
  {
    src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=86',
    title: 'Green Texture',
    label: 'Nature',
    meta: 'Color study',
  },
]

const collections = [
  {
    title: '街头与城市',
    description: '用几何、反射和人的尺度记录城市的秩序与偶然。',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=84',
  },
  {
    title: '自然与风景',
    description: '关注光线、空气感和地貌层次，让画面保持安静的张力。',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=84',
  },
  {
    title: '色彩与后期',
    description: '围绕胶片暖色、银灰中性色和低饱和科技蓝建立统一视觉语言。',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=84',
  },
]

const formatDate = (value: string | null, fallback: string) => {
  return new Date(value || fallback).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PhotographyPage() {
  const [latestPosts, setLatestPosts] = useState<PhotographyPost[]>([])

  useEffect(() => {
    const loadLatestPhotography = async () => {
      const response = await fetch('/api/posts?category=photography&limit=9')
      if (!response.ok) return

      const data = await response.json()
      setLatestPosts(data.posts || [])
    }

    loadLatestPhotography()
  }, [])

  const frames = useMemo(() => {
    const publishedFrames = latestPosts
      .filter((post) => post.media[0]?.media.url)
      .slice(0, 4)
      .map((post) => ({
        src: post.media[0].media.url,
        title: post.title,
        label: post.photoSeries || 'Published work',
        meta: [post.camera, post.focalLength, post.locationName].filter(Boolean).slice(0, 2).join(' / ') || formatDate(post.publishedAt, post.createdAt),
        slug: post.slug,
      }))

    return publishedFrames.length ? publishedFrames : galleryFrames
  }, [latestPosts])

  const getPhotoMeta = (post: PhotographyPost) => {
    return [post.camera, post.lens, post.focalLength, post.aperture, post.locationName]
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#080807] text-white">
        <section className="relative min-h-[92vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={frames[0].src}
              alt={frames[0].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.9),rgba(8,8,7,0.42),rgba(8,8,7,0.08))]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080807] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75 }}
                className="max-w-4xl"
              >
                <div className="mb-6 inline-flex items-center gap-3 border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/75 backdrop-blur-md">
                  <Film className="h-4 w-4 text-amber-100" />
                  Photography Portfolio
                </div>
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
                  影像不是装饰，
                  <span className="block text-white/70">是观察方式。</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                  以现场光线、空间秩序和色彩情绪为线索，记录摄影作品、器材参数、后期思路与视觉系统。
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#gallery"
                    className="group inline-flex items-center justify-center gap-3 bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-100"
                  >
                    浏览作品
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/write"
                    className="group inline-flex items-center justify-center gap-3 border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.14]"
                  >
                    发布新作品
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.12 }}
                className="hidden border border-white/10 bg-white/10 p-5 backdrop-blur-md lg:block"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/50">
                  <span>Featured frame</span>
                  <Aperture className="h-4 w-4 text-white/60" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {frames.slice(1, 4).map((frame) => (
                    <div key={frame.title} className="aspect-[3/4] overflow-hidden bg-white/5">
                      <img src={frame.src} alt={frame.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-2xl font-semibold leading-tight">{frames[0].title}</p>
                <p className="mt-2 text-sm text-white/50">{frames[0].meta}</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-100/60">Selected Works</p>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">精选摄影作品</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/50">
              大图优先，减少信息噪音；悬停时只显示必要的作品标题、系列和拍摄信息。
            </p>
          </div>

          <div className="grid auto-rows-[260px] gap-4 md:grid-cols-2 lg:grid-cols-4">
            {frames.map((frame, index) => (
              <motion.article
                key={frame.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden border border-white/10 bg-white/5 ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                } ${index === 3 ? 'lg:col-span-2' : ''}`}
              >
                <PortfolioFrame frame={frame} large={index === 0} />
              </motion.article>
            ))}
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className="border-y border-white/10 bg-[#0d0d0c]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.28em] text-cyan-100/60">Published Notes</p>
                  <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">最近发布的摄影记录</h2>
                </div>
                <Link
                  href="/posts?category=photography"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
                >
                  查看全部
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/posts/${post.slug}`} className="block h-full border border-white/10 bg-white/[0.035] transition duration-300 hover:border-amber-100/30 hover:bg-white/[0.06]">
                      <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                        {post.media[0]?.media.url ? (
                          <img
                            src={post.media[0].media.url}
                            alt={post.media[0].media.alt || post.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(103,232,249,0.12))]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-white/40">
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
                        <h3 className="text-xl font-semibold leading-snug tracking-normal transition group-hover:text-amber-100">
                          {post.title}
                        </h3>
                        {getPhotoMeta(post) && (
                          <p className="mt-3 line-clamp-1 text-xs uppercase tracking-[0.16em] text-cyan-100/60">
                            {getPhotoMeta(post)}
                          </p>
                        )}
                        {post.excerpt && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/50">{post.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">Collections</p>
            <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">摄影方向</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="group relative min-h-[360px] overflow-hidden border border-white/10 bg-white/5"
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
                    <Camera className="h-3.5 w-3.5" />
                    Collection 0{index + 1}
                  </p>
                  <h3 className="text-2xl font-semibold">{collection.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{collection.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
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
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-amber-100/60">{frame.label}</p>
        <h3 className={large ? 'max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl' : 'text-2xl font-semibold tracking-normal'}>
          {frame.title}
        </h3>
        <p className="mt-3 text-sm text-white/50">{frame.meta}</p>
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
