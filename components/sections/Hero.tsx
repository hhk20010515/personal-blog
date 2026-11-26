'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Aperture, Camera, Code2, MoveDown } from 'lucide-react'
import PhotoPlaceholder from '@/components/media/PhotoPlaceholder'
import { optimizedImage } from '@/lib/cloudinary-url'

interface HeroFrame {
  src: string
  label: string
  meta: string
  slug: string
}

interface HeroPost {
  title: string
  slug: string
  camera?: string | null
  focalLength?: string | null
  aperture?: string | null
  locationName?: string | null
  media: Array<{ media: { url: string } }>
}

// 首屏使用最近发布的三张摄影作品
function useHeroFrames() {
  const [frames, setFrames] = useState<HeroFrame[]>([])

  useEffect(() => {
    fetch('/api/posts?category=photography&limit=6')
      .then((response) => (response.ok ? response.json() : { posts: [] }))
      .then((data) => {
        const posts: HeroPost[] = data.posts || []
        setFrames(
          posts
            .filter((post) => post.media[0]?.media.url)
            .slice(0, 3)
            .map((post) => ({
              src: post.media[0].media.url,
              label: post.title,
              meta: [post.camera, post.focalLength, post.aperture, post.locationName].filter(Boolean).slice(0, 3).join(' · '),
              slug: post.slug,
            }))
        )
      })
      .catch(() => undefined)
  }, [])

  return frames
}

const stats = [
  { value: 'PHOTO', label: '影像叙事' },
  { value: 'TECH', label: '前沿观察' },
  { value: 'FIELD', label: '现场记录' },
]

export default function Hero() {
  const heroImages = useHeroFrames()

  return (
    <section className="dark relative min-h-screen overflow-hidden bg-canvas text-foreground">
      <div className="absolute inset-0">
        {heroImages[0] ? (
          <img
            src={optimizedImage(heroImages[0].src, 2400)}
            alt={heroImages[0].label}
            className="h-full w-full object-cover"
          />
        ) : (
          <PhotoPlaceholder />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.92)_0%,rgba(8,8,7,0.64)_38%,rgba(8,8,7,0.14)_100%)]" />
        <div className="hero-fade absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-3 border border-foreground/20 bg-foreground/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-foreground/80 backdrop-blur-md">
              <Aperture className="h-4 w-4 text-amber-700 dark:text-amber-200" />
              Visual Journal / Tech Notes
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
              用影像建立审美，
              <span className="block text-foreground/70">用技术解释世界。</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
              这里记录摄影作品、拍摄现场、器材与后期思考，也持续观察 AI、Web、工程系统和数字创作工具的变化。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/photography"
                className="group inline-flex items-center justify-center gap-3 bg-foreground px-6 py-3 text-sm font-semibold text-background transition duration-300 hover:bg-amber-700 dark:hover:bg-amber-100"
              >
                进入摄影作品集
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/tech"
                className="group inline-flex items-center justify-center gap-3 border border-foreground/20 bg-foreground/[0.08] px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-md transition duration-300 hover:border-cyan-700/50 dark:hover:border-cyan-200/50 hover:bg-cyan-700/10 dark:hover:bg-cyan-200/10"
              >
                阅读技术观察
                <Code2 className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-foreground/10 py-5">
              {stats.map((item) => (
                <div key={item.value} className="border-foreground/10 px-4 first:pl-0 [&:not(:last-child)]:border-r">
                  <div className="text-sm font-semibold tracking-[0.22em] text-amber-700 dark:text-amber-100">{item.value}</div>
                  <div className="mt-2 text-xs text-foreground/50">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div className="ml-auto w-full max-w-xl">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-foreground/50">
                <span>Selected frames</span>
                <Camera className="h-4 w-4 text-foreground/70" />
              </div>
              <div className="grid grid-cols-[1fr_0.76fr] gap-4">
                <Link
                  href={heroImages[1] ? `/posts/${heroImages[1].slug}` : '/photography'}
                  className="group relative block aspect-[4/5] overflow-hidden border border-foreground/10 bg-foreground/[0.08]"
                >
                  {heroImages[1] ? (
                    <img
                      src={optimizedImage(heroImages[1].src, 900)}
                      alt={heroImages[1].label}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <PhotoPlaceholder />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {heroImages[1] && (
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-lg font-semibold">{heroImages[1].label}</p>
                      {heroImages[1].meta && (
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/50">{heroImages[1].meta}</p>
                      )}
                    </div>
                  )}
                </Link>
                <div className="flex flex-col gap-4">
                  <Link
                    href={heroImages[2] ? `/posts/${heroImages[2].slug}` : '/photography'}
                    className="group relative block aspect-[4/3] overflow-hidden border border-foreground/10 bg-foreground/[0.08]"
                  >
                    {heroImages[2] ? (
                      <img
                        src={optimizedImage(heroImages[2].src, 700)}
                        alt={heroImages[2].label}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <PhotoPlaceholder />
                    )}
                  </Link>
                  <div className="border border-foreground/10 bg-foreground/10 p-5 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-700/70 dark:text-cyan-100/70">Current focus</p>
                    <p className="mt-4 text-2xl font-semibold leading-tight">AI image workflow, visual systems, field notes.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.22em] text-foreground/50 md:flex">
          <MoveDown className="h-4 w-4" />
          Scroll
        </div>
      </div>
    </section>
  )
}
