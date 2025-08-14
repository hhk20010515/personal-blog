'use client'

import { useEffect, useState } from 'react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Eye,
  Heart,
  TrendingUp,
  Calendar,
  Image
} from 'lucide-react'

interface DashboardStats {
  overview: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalUsers: number
    totalComments: number
    approvedComments: number
    totalViews: number
    totalLikes: number
    totalMedia: number
  }
  growth: {
    newPostsLastMonth: number
    newUsersLastMonth: number
    newCommentsLastMonth: number
    viewsLastMonth: number
  }
  recent: {
    posts: any[]
    comments: any[]
    users: any[]
  }
  popular: {
    posts: any[]
  }
  categories: any[]
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  trend 
}: { 
  title: string
  value: string | number
  icon: any
  change?: string
  trend?: 'up' | 'down'
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-background rounded-xl border border-border p-6 card-hover"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {change}
          </div>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </motion.div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载失败，请刷新页面重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">欢迎回到管理后台</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总文章数"
          value={stats.overview.totalPosts}
          icon={FileText}
          change={`+${stats.growth.newPostsLastMonth} 本月`}
          trend="up"
        />
        <StatCard
          title="总用户数"
          value={stats.overview.totalUsers}
          icon={Users}
          change={`+${stats.growth.newUsersLastMonth} 本月`}
          trend="up"
        />
        <StatCard
          title="总评论数"
          value={stats.overview.totalComments}
          icon={MessageSquare}
          change={`+${stats.growth.newCommentsLastMonth} 本月`}
          trend="up"
        />
        <StatCard
          title="总浏览量"
          value={stats.overview.totalViews.toLocaleString()}
          icon={Eye}
          change={`+${stats.growth.viewsLastMonth.toLocaleString()} 本月`}
          trend="up"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="已发布文章"
          value={stats.overview.publishedPosts}
          icon={FileText}
        />
        <StatCard
          title="草稿文章"
          value={stats.overview.draftPosts}
          icon={FileText}
        />
        <StatCard
          title="待审评论"
          value={stats.overview.totalComments - stats.overview.approvedComments}
          icon={MessageSquare}
        />
        <StatCard
          title="总点赞数"
          value={stats.overview.totalLikes}
          icon={Heart}
        />
        <StatCard
          title="媒体文件"
          value={stats.overview.totalMedia}
          icon={Image}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">最近文章</h2>
            <a href="/admin/posts" className="text-primary hover:underline text-sm">
              查看全部
            </a>
          </div>
          <div className="space-y-4">
            {stats.recent.posts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{post.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>{post.author.name}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {post.viewCount} 次浏览
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">最近评论</h2>
            <a href="/admin/comments" className="text-primary hover:underline text-sm">
              查看全部
            </a>
          </div>
          <div className="space-y-4">
            {stats.recent.comments.slice(0, 5).map((comment) => (
              <div key={comment.id} className="border-l-2 border-primary/20 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {comment.author.name} 评论了 《{comment.post.title}》
                    </p>
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ml-2 ${
                    comment.isApproved
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {comment.isApproved ? '已审核' : '待审核'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Popular Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-background rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">热门文章</h2>
          <a href="/admin/analytics" className="text-primary hover:underline text-sm">
            查看分析
          </a>
        </div>
        <div className="space-y-4">
          {stats.popular.posts.slice(0, 5).map((post, index) => (
            <div key={post.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{post.title}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{post.author.name}</span>
                  <span>{post.category?.name}</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{post.viewCount} 浏览</p>
                <p className="text-muted-foreground">{post._count.likes} 点赞</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Categories Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-background rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">分类统计</h2>
          <a href="/admin/categories" className="text-primary hover:underline text-sm">
            管理分类
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.categories.map((category) => (
            <div key={category.id} className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="font-medium">{category.name}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {category._count.posts}
              </p>
              <p className="text-xs text-muted-foreground">篇文章</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}