'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Aperture, Camera, Code2, MoveDown } from 'lucide-react'

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85',
    label: 'Mountain Light',
    meta: 'f/2.8 · 35mm · ISO 200',
  },
  {
    src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85',
    label: 'Urban Night',
    meta: 'Long exposure',
  },
  {
    src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=85',
    label: 'Forest Study',
    meta: 'Natural color',
  },
]

const stats = [
  { value: 'PHOTO', label: '影像叙事' },
  { value: 'TECH', label: '前沿观察' },
  { value: 'FIELD', label: '现场记录' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#080807] text-white">
      <div className="absolute inset-0">
        <img
          src={heroImages[0].src}
          alt="山谷与光线构成的摄影首屏背景"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.92)_0%,rgba(8,8,7,0.64)_38%,rgba(8,8,7,0.14)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080807] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-3 border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
              <Aperture className="h-4 w-4 text-amber-200" />
              Visual Journal / Tech Notes
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
              用影像建立审美，
              <span className="block text-white/70">用技术解释世界。</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              这里记录摄影作品、拍摄现场、器材与后期思考，也持续观察 AI、Web、工程系统和数字创作工具的变化。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/photography"
                className="group inline-flex items-center justify-center gap-3 bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition duration-300 hover:bg-amber-100"
              >
                进入摄影作品集
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/tech"
                className="group inline-flex items-center justify-center gap-3 border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:border-cyan-200/50 hover:bg-cyan-200/10"
              >
                阅读技术观察
                <Code2 className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">
              {stats.map((item) => (
                <div key={item.value} className="border-white/10 px-4 first:pl-0 [&:not(:last-child)]:border-r">
                  <div className="text-sm font-semibold tracking-[0.22em] text-amber-100">{item.value}</div>
                  <div className="mt-2 text-xs text-white/50">{item.label}</div>
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
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/50">
                <span>Selected frames</span>
                <Camera className="h-4 w-4 text-white/70" />
              </div>
              <div className="grid grid-cols-[1fr_0.76fr] gap-4">
                <div className="group relative aspect-[4/5] overflow-hidden border border-white/10 bg-white/[0.08]">
                  <img
                    src={heroImages[1].src}
                    alt="城市夜景摄影作品"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-lg font-semibold">{heroImages[1].label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">{heroImages[1].meta}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="group relative aspect-[4/3] overflow-hidden border border-white/10 bg-white/[0.08]">
                    <img
                      src={heroImages[2].src}
                      alt="森林光线摄影作品"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Current focus</p>
                    <p className="mt-4 text-2xl font-semibold leading-tight">AI image workflow, visual systems, field notes.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/50 md:flex">
          <MoveDown className="h-4 w-4" />
          Scroll
        </div>
      </div>
    </section>
  )
}
