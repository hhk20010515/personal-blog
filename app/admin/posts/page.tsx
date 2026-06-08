'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  isFeatured: boolean
  isPinned: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  publishedAt: string | null
  author: {
    id: string
    name: string
    image: string | null
  }
  category: {
    id: string
    name: string
  } | null
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
  _count: {
    likes: number
    comments: number
  }
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { toast } = useToast()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        includeUnpublished: 'true'
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
      toast({
        title: '加载失败',
        description: '无法加载文章列表',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, page, searchQuery, statusFilter, toast])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleDelete = async (postId: string, slug: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
        toast({
          title: '删除成功',
          description: '文章已成功删除'
        })
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除文章，请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">已发布</span>
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">草稿</span>
      case 'ARCHIVED':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">已归档</span>
      default:
        return null
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return '🔒'
      case 'UNLISTED':
        return '👁️'
      default:
        return '🌐'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground">管理所有博客文章</p>
        </div>
        
        <Link href="/write">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            写新文章
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="PUBLISHED">已发布</SelectItem>
            <SelectItem value="DRAFT">草稿</SelectItem>
            <SelectItem value="ARCHIVED">已归档</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="分类筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem value="tech">技术</SelectItem>
            <SelectItem value="photography">摄影</SelectItem>
            <SelectItem value="life">生活</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无文章</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium">标题</th>
                  <th className="text-left p-4 font-medium">作者</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">分类</th>
                  <th className="text-left p-4 font-medium">统计</th>
                  <th className="text-left p-4 font-medium">日期</th>
                  <th className="text-right p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/20"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium truncate max-w-[300px]">
                              {post.title}
                            </h3>
                            {post.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                            <span>{getVisibilityIcon(post.visibility)}</span>
                            <span>/{post.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {post.author.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm">{post.author.name}</span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {getStatusBadge(post.status)}
                    </td>
                    
                    <td className="p-4">
                      <span className="text-sm">
                        {post.category?.name || '无分类'}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>{post._count.comments}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <div>创建: {new Date(post.createdAt).toLocaleDateString()}</div>
                        {post.publishedAt && (
                          <div>发布: {new Date(post.publishedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              查看文章
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/write?edit=${post.slug}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑文章
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(post.id, post.slug)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除文章
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
