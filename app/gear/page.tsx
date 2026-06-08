'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Cpu, Gauge, ShieldCheck, SlidersHorizontal, Weight } from 'lucide-react'

interface GearPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  createdAt: string
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
  firmwareVersion?: string | null
  media: Array<{
    media: {
      url: string
      alt?: string | null
    }
  }>
}

const fallbackGear = [
  {
    title: '相机机身测评模板',
    description: '围绕传感器、动态范围、对焦、续航、重量、固件版本建立可复用测评维度。',
    spec: 'Body / Sensor / AF',
  },
  {
    title: '镜头光学测评模板',
    description: '记录锐度、畸变、色散、焦外、最近对焦距离和实际出片体验。',
    spec: 'Lens / MTF / Bokeh',
  },
  {
    title: '影像工作流测评模板',
    description: '覆盖稳定器、灯光、存储、监视器和 AI 后期工具的实战表现。',
    spec: 'Workflow / Field use',
  },
]

const formatDate = (value: string | null, fallback: string) => {
  return new Date(value || fallback).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function GearPage() {
  const [posts, setPosts] = useState<GearPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGearPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/posts?category=gear&limit=12')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } finally {
        setLoading(false)
      }
    }

    loadGearPosts()
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#05070c] text-white">
        <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,229,255,0.2),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(255,0,128,0.14),transparent_34%),linear-gradient(180deg,#05070c,#090b12)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="mb-5 inline-flex items-center gap-3 border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                <Cpu className="h-4 w-4" />
                Gear Lab
              </p>
              <h1 className="text-5xl font-semibold leading-[0.96] tracking-normal sm:text-7xl">
                摄影器材测评，
                <span className="block text-cyan-100/72">用参数解释体验。</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/60">
                面向所有摄影爱好者，记录相机、镜头、灯光、稳定器和影像工作流工具的真实体验、硬核规格和样片观察。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/write" className="inline-flex items-center justify-center gap-3 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
                  分享测评
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search?q=器材" className="inline-flex items-center justify-center gap-3 border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.08]">
                  搜索器材
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <SpecTile icon={Gauge} label="评分体系" value="0-10" />
              <SpecTile icon={SlidersHorizontal} label="动态范围 / 对焦" value="Hard specs" />
              <SpecTile icon={Weight} label="重量 / 价格" value="Field data" />
              <SpecTile icon={ShieldCheck} label="防护 / 固件" value="Firmware" />
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {loading ? (
            <div className="border border-white/10 bg-white/[0.035] p-8 text-white/50">正在加载器材测评...</div>
          ) : posts.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.04 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/posts/${post.slug}`} className="block h-full border border-white/10 bg-white/[0.035] transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.055]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-cyan-300/[0.06]">
                      {post.media[0]?.media.url ? (
                        <img
                          src={post.media[0].media.url}
                          alt={post.media[0].media.alt || post.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(0,229,255,0.18),rgba(255,0,128,0.12))]" />
                      )}
                      <div className="absolute left-4 top-4 border border-cyan-300/30 bg-black/40 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur">
                        {post.reviewRating ? `${post.reviewRating.toFixed(1)} / 10` : post.gearType || 'Gear'}
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">
                        {formatDate(post.publishedAt, post.createdAt)}
                      </p>
                      <h2 className="text-2xl font-semibold leading-tight tracking-normal transition group-hover:text-cyan-100">
                        {post.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/50">{post.excerpt || '暂无摘要'}</p>

                      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                        <Param label="型号" value={[post.gearBrand, post.gearModel].filter(Boolean).join(' ')} />
                        <Param label="规格" value={post.sensorFormat || undefined} />
                        <Param label="像素" value={post.megapixels ? `${post.megapixels} MP` : undefined} />
                        <Param label="重量" value={post.weightGrams ? `${post.weightGrams} g` : undefined} />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {fallbackGear.map((item) => (
                <div key={item.title} className="border border-white/10 bg-white/[0.035] p-6">
                  <p className="mb-4 text-xs uppercase tracking-[0.22em] text-cyan-100/55">{item.spec}</p>
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-white/50">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

function SpecTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
      <Icon className="mb-5 h-5 w-5 text-cyan-200" />
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function Param({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-white/10 bg-black/20 p-3">
      <p className="text-white/40">{label}</p>
      <p className="mt-1 truncate text-cyan-100/80">{value || '-'}</p>
    </div>
  )
}
