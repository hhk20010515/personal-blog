'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Gauge, ShieldCheck, Weight } from 'lucide-react'

interface GearReview {
  id: string
  title: string
  slug: string
  excerpt: string | null
  gearBrand?: string | null
  gearModel?: string | null
  gearType?: string | null
  sensorFormat?: string | null
  megapixels?: number | null
  weightGrams?: number | null
  reviewRating?: number | null
  autofocusSystem?: string | null
}

const fallbackReviews = [
  {
    title: '相机机身测评：从传感器到对焦系统',
    excerpt: '记录像素、动态范围、对焦覆盖、固件版本、重量和实际拍摄体验。',
    spec: 'Body / Sensor / AF',
  },
  {
    title: '镜头测评：锐度、焦外和实际出片',
    excerpt: '关注最大光圈表现、边缘画质、色散控制、最近对焦和拍摄风格适配。',
    spec: 'Lens / Optics / Bokeh',
  },
  {
    title: '影像工作流：灯光、稳定器和后期工具',
    excerpt: '从现场可靠性、参数设置到 AI 后期效率，建立完整创作链路。',
    spec: 'Workflow / Field use',
  },
]

export default function GearReviews() {
  const [reviews, setReviews] = useState<GearReview[]>([])

  useEffect(() => {
    const loadReviews = async () => {
      const response = await fetch('/api/posts?category=gear&limit=3')
      if (!response.ok) return

      const data = await response.json()
      setReviews(data.posts || [])
    }

    loadReviews()
  }, [])

  return (
    <section className="relative overflow-hidden border-t border-cyan-300/10 bg-[#05070c] text-white">
      <div className="cyber-grid absolute inset-0 opacity-80" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-100/60">
              <Cpu className="h-4 w-4" />
              Gear review lab
            </p>
            <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">摄影器材测评</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
              支持用户分享相机、镜头、灯光、稳定器和后期工具的硬核参数，让体验和数据一起说话。
            </p>
          </div>
          <Link href="/gear" className="group inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
            进入测评板块
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(reviews.length ? reviews : fallbackReviews).map((review: any, index) => (
            <motion.article
              key={review.id || review.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link
                href={review.slug ? `/posts/${review.slug}` : '/gear'}
                className="block h-full border border-cyan-300/12 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="border border-cyan-300/20 bg-cyan-300/[0.08] p-3 text-cyan-100">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {review.reviewRating ? `${review.reviewRating.toFixed(1)} / 10` : review.spec || review.gearType || 'Review'}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold leading-tight tracking-normal transition group-hover:text-cyan-100">
                  {review.title}
                </h3>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/50">{review.excerpt || '暂无摘要'}</p>

                <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                  <Spec icon={Gauge} label="规格" value={review.sensorFormat || review.gearBrand || '-'} />
                  <Spec icon={Weight} label="重量" value={review.weightGrams ? `${review.weightGrams}g` : '-'} />
                  <Spec icon={ShieldCheck} label="对焦" value={review.autofocusSystem || review.gearModel || '-'} />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black/20 p-3">
      <Icon className="mb-2 h-3.5 w-3.5 text-cyan-200" />
      <p className="text-white/40">{label}</p>
      <p className="mt-1 truncate text-white/75">{value}</p>
    </div>
  )
}
