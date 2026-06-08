'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search, Filter, Calendar, Eye, Heart, MessageCircle, User, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
  category: {
    id: string
    name: string
    slug: string
    color?: string | null
  } | null
  author: {
    id: string
    name: string | null
    image?: string | null
  }
  createdAt: string
  publishedAt: string | null
  viewCount: number
  likeCount: number
  _count: {
    likes: number
    comments: number
  }
}

const categoryColors: Record<string, string> = {
  tech: 'from-blue-500 to-purple-600',
  photography: 'from-amber-500 to-orange-600',
  gear: 'from-cyan-400 to-fuchsia-600',
  life: 'from-rose-500 to-pink-600',
}

function PostsContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category.toLowerCase())
    }
  }, [searchParams])

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)

      try {
        const response = await fetch('/api/posts?limit=50')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts)
        }
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const categories = useMemo(() => {
    const bySlug = new Map<string, { slug: string; name: string }>()
    posts.forEach((post) => {
      if (post.category) {
        bySlug.set(post.category.slug, {
          slug: post.category.slug,
          name: post.category.name,
        })
      }
    })
    return Array.from(bySlug.values())
  }, [posts])

  const filteredPosts = useMemo(() => {
    let filtered = posts

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category?.slug === selectedCategory)
    }

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase()
      filtered = filtered.filter((post) => {
        return (
          post.title.toLowerCase().includes(normalizedSearch) ||
          (post.excerpt || '').toLowerCase().includes(normalizedSearch) ||
          post.tags.some(({ tag }) => tag.name.toLowerCase().includes(normalizedSearch))
        )
      })
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b._count?.likes || b.likeCount) - (a._count?.likes || a.likeCount)
        case 'views':
          return b.viewCount - a.viewCount
        case 'latest':
        default:
          return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      }
    })
  }, [posts, selectedCategory, searchTerm, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#05070c] text-white">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                所有文章
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                探索摄影作品、器材测评和前沿技术观察，发现更多有价值的观点和参数记录
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 border border-cyan-300/12 bg-white/[0.045] p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文章标题、摘要或标签..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10 bg-white/[0.06] border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    全部
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.slug}
                      variant={selectedCategory === category.slug ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'latest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('latest')}
                  >
                    最新
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                  >
                    最受欢迎
                  </Button>
                  <Button
                    variant={sortBy === 'views' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('views')}
                  >
                    最多浏览
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">没有找到匹配的文章</h3>
                <p className="text-muted-foreground">
                  尝试调整搜索条件或查看所有文章
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="group"
                  >
                    <article className="h-full overflow-hidden border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/[0.055] flex flex-col">
                      <div className="p-6 pb-0">
                        {post.category && (
                          <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${categoryColors[post.category.slug] || 'from-slate-500 to-slate-700'}`}>
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      <div className="p-6 pt-4 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          <Link href={`/posts/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>

                        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
                          {post.excerpt || '暂无摘要'}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map(({ tag }) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-xs rounded-md"
                            >
                              <Tag className="h-3 w-3" />
                              {tag.name}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {post.author.image ? (
                              <img
                                src={post.author.image}
                                alt={post.author.name || 'Author'}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                            )}
                            <span>{post.author.name || '作者'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {formatNumber(post.viewCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {formatNumber(post._count?.likes || post.likeCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post._count?.comments || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <PostsContent />
    </Suspense>
  )
}
