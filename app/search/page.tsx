'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, Cpu, Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface SearchPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  createdAt: string
  camera?: string | null
  gearBrand?: string | null
  gearModel?: string | null
  reviewRating?: number | null
  category: {
    name: string
    slug: string
  } | null
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', '30')
        if (initialQuery.trim()) params.set('search', initialQuery.trim())

        const response = await fetch(`/api/posts?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [initialQuery])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const next = query.trim()
    window.history.pushState(null, '', next ? `/search?q=${encodeURIComponent(next)}` : '/search')
    window.dispatchEvent(new PopStateEvent('popstate'))
    const params = new URLSearchParams()
    params.set('limit', '30')
    if (next) params.set('search', next)
    setLoading(true)
    fetch(`/api/posts?${params.toString()}`)
      .then((response) => response.ok ? response.json() : { posts: [] })
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#05070c] text-white">
        <section className="relative overflow-hidden px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,229,255,0.16),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,0,128,0.12),transparent_34%)]" />
          <div className="relative mx-auto max-w-5xl">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-cyan-100/55">Search Luce</p>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">搜索摄影、器材与技术内容</h1>
            <form onSubmit={submitSearch} className="mt-8 flex flex-col gap-3 border border-cyan-300/15 bg-white/[0.04] p-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-100/45" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="输入关键词，例如 X100VI、街头摄影、AI 后期..."
                  className="h-12 w-full bg-transparent pl-12 pr-4 text-white outline-none placeholder:text-white/40"
                />
              </div>
              <button className="bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
                搜索
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          {loading ? (
            <div className="border border-white/10 bg-white/[0.035] p-8 text-white/50">正在搜索...</div>
          ) : posts.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.035] p-8 text-white/50">
              {initialQuery ? '没有找到匹配内容。' : '输入关键词后可搜索标题、摘要、正文和标签。'}
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={`/posts/${post.slug}`} className="group grid gap-5 border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06] md:grid-cols-[1fr_auto]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        {post.category && <span className="border border-white/10 px-2 py-1">{post.category.name}</span>}
                        {post.gearBrand && (
                          <span className="inline-flex items-center gap-1 text-cyan-100/70">
                            <Cpu className="h-3.5 w-3.5" />
                            {post.gearBrand} {post.gearModel}
                          </span>
                        )}
                        {post.camera && (
                          <span className="inline-flex items-center gap-1 text-amber-100/70">
                            <Camera className="h-3.5 w-3.5" />
                            {post.camera}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-semibold tracking-normal transition group-hover:text-cyan-100">{post.title}</h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/50">{post.excerpt || '暂无摘要'}</p>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-cyan-100">
                      打开
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05070c] text-white" />}>
      <SearchContent />
    </Suspense>
  )
}
