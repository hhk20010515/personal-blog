'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
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
  excerpt: string
  content: string
  category: 'TECH' | 'PHOTOGRAPHY' | 'LIFE'
  tags: string[]
  author: {
    id: string
    name: string
    image?: string
  }
  createdAt: string
  updatedAt: string
  published: boolean
  views: number
  likes: number
  _count: {
    comments: number
  }
}

const categoryLabels = {
  'TECH': '技术',
  'PHOTOGRAPHY': '摄影',
  'LIFE': '生活'
}

const categoryColors = {
  'TECH': 'from-blue-500 to-purple-600',
  'PHOTOGRAPHY': 'from-amber-500 to-orange-600',
  'LIFE': 'from-rose-500 to-pink-600'
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'GPT-5与Gemini 2.5：2025年AI大语言模型新突破',
    excerpt: '深入探讨最新的大语言模型技术发展，了解GPT-5和Gemini 2.5如何改变AI应用的格局...',
    content: '',
    category: 'TECH',
    tags: ['AI', 'GPT-5', 'Gemini', '机器学习'],
    author: {
      id: 'user1',
      name: '技术探索者',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    published: true,
    views: 1250,
    likes: 89,
    _count: { comments: 23 }
  },
  {
    id: '2',
    title: '2025年摄影趋势：明亮色彩与真实情感的回归',
    excerpt: '探索今年摄影界的最新趋势，从色彩运用到情感表达，看摄影艺术如何演进...',
    content: '',
    category: 'PHOTOGRAPHY',
    tags: ['摄影趋势', '色彩', '情感摄影', '2025'],
    author: {
      id: 'user2',
      name: '光影记录者',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c88ca90a?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-09T15:30:00Z',
    updatedAt: '2025-01-09T15:30:00Z',
    published: true,
    views: 890,
    likes: 67,
    _count: { comments: 15 }
  },
  {
    id: '3',
    title: '正念生活：在数字时代寻找内心的平静',
    excerpt: '在这个数字化的时代，如何通过正念练习找到内心的平静与专注，建立健康的生活方式...',
    content: '',
    category: 'LIFE',
    tags: ['正念', '数字排毒', '生活方式', '心理健康'],
    author: {
      id: 'user3',
      name: '生活哲学家',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-08T09:15:00Z',
    updatedAt: '2025-01-08T09:15:00Z',
    published: true,
    views: 720,
    likes: 45,
    _count: { comments: 12 }
  },
  {
    id: '4',
    title: 'Next.js 14全栈开发最佳实践',
    excerpt: '深入了解Next.js 14的新特性，App Router架构设计，以及现代Web开发的最佳实践...',
    content: '',
    category: 'TECH',
    tags: ['Next.js', 'React', 'Web开发', '前端'],
    author: {
      id: 'user1',
      name: '技术探索者',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-07T14:20:00Z',
    updatedAt: '2025-01-07T14:20:00Z',
    published: true,
    views: 1050,
    likes: 78,
    _count: { comments: 19 }
  },
  {
    id: '5',
    title: '街头摄影的艺术：捕捉城市生活的真实瞬间',
    excerpt: '学习街头摄影的技巧与心得，如何在繁忙的城市中发现并记录那些感人的瞬间...',
    content: '',
    category: 'PHOTOGRAPHY',
    tags: ['街头摄影', '城市', '纪实摄影', '摄影技巧'],
    author: {
      id: 'user2',
      name: '光影记录者',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c88ca90a?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-06T11:45:00Z',
    updatedAt: '2025-01-06T11:45:00Z',
    published: true,
    views: 650,
    likes: 52,
    _count: { comments: 8 }
  },
  {
    id: '6',
    title: '简约主义生活：拥有更少，体验更多',
    excerpt: '探索简约主义的生活哲学，了解如何通过减法生活获得更多的自由与幸福...',
    content: '',
    category: 'LIFE',
    tags: ['简约主义', '生活哲学', '断舍离', '幸福'],
    author: {
      id: 'user3',
      name: '生活哲学家',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    createdAt: '2025-01-05T16:10:00Z',
    updatedAt: '2025-01-05T16:10:00Z',
    published: true,
    views: 580,
    likes: 41,
    _count: { comments: 14 }
  }
]

export default function PostsPage() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')

  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category.toUpperCase())
    }
  }, [searchParams])

  // Filter and sort posts
  useEffect(() => {
    let filtered = posts

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort posts
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes
        case 'views':
          return b.views - a.views
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredPosts(filtered)
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
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Header Section */}
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
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                探索技术、摄影和生活的精彩内容，发现更多有趣的观点和见解
              </p>
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-effect rounded-xl p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文章标题、内容或标签..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    全部
                  </Button>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Sort Options */}
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

        {/* Posts Grid */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
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
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <article className="glass-effect rounded-xl overflow-hidden card-hover h-full flex flex-col">
                      {/* Category Badge */}
                      <div className="p-6 pb-0">
                        <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${categoryColors[post.category]}`}>
                          {categoryLabels[post.category]}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 pt-4 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          <Link href={`/posts/${post.id}`}>
                            {post.title}
                          </Link>
                        </h2>
                        
                        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-xs rounded-md"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Author and Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {post.author.image ? (
                              <img
                                src={post.author.image}
                                alt={post.author.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                            )}
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {formatNumber(post.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {formatNumber(post.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post._count.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-12"
              >
                <Button variant="outline" size="lg">
                  加载更多文章
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}