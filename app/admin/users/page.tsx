'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Ban,
  User,
  Mail,
  Calendar,
  UserCheck,
  AlertTriangle
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'USER' | 'ADMIN'
  isBlocked: boolean
  blockReason: string | null
  createdAt: string
  _count: {
    posts: number
    comments: number
    followers: number
    following: number
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [actionType, setActionType] = useState<'block' | 'unblock' | 'promote' | 'demote'>('block')

  const { toast } = useToast()

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('blocked', statusFilter)

      const response = await fetch(`/api/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: '加载失败',
        description: '无法加载用户列表',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page, searchQuery, roleFilter, statusFilter])

  const handleBulkAction = async (action: 'block' | 'unblock' | 'promote' | 'demote') => {
    if (selectedUsers.size === 0) {
      toast({
        title: '请选择用户',
        description: '请至少选择一个用户进行操作',
        variant: 'destructive'
      })
      return
    }

    if (action === 'block') {
      setActionType('block')
      setShowBlockDialog(true)
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedUsers),
          reason: action === 'unblock' ? blockReason : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        loadUsers()
        setSelectedUsers(new Set())
        
        const successCount = data.results.filter((r: any) => r.success).length
        toast({
          title: '操作成功',
          description: `已成功处理 ${successCount} 个用户`
        })
      } else {
        throw new Error('Bulk action failed')
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '无法执行批量操作，请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const handleBlockUsers = async () => {
    if (!blockReason.trim()) {
      toast({
        title: '请输入封禁原因',
        variant: 'destructive'
      })
      return
    }

    await handleBulkAction('block')
    setShowBlockDialog(false)
    setBlockReason('')
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)))
    }
  }

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 flex items-center">
        <Shield className="h-3 w-3 mr-1" />
        管理员
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center">
        <User className="h-3 w-3 mr-1" />
        用户
      </span>
    )
  }

  const getStatusBadge = (isBlocked: boolean) => {
    return isBlocked ? (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center">
        <Ban className="h-3 w-3 mr-1" />
        已封禁
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center">
        <UserCheck className="h-3 w-3 mr-1" />
        正常
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户管理</h1>
        <p className="text-muted-foreground">管理所有注册用户</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="角色筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            <SelectItem value="USER">用户</SelectItem>
            <SelectItem value="ADMIN">管理员</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="false">正常用户</SelectItem>
            <SelectItem value="true">已封禁</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              已选择 {selectedUsers.size} 个用户
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('promote')}
              >
                <Shield className="h-4 w-4 mr-2" />
                设为管理员
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('demote')}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                取消管理员
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('block')}
              >
                <Ban className="h-4 w-4 mr-2" />
                封禁用户
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('unblock')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                解封用户
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无用户</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-input"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">用户</th>
                  <th className="text-left p-4 font-medium">角色</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">统计</th>
                  <th className="text-left p-4 font-medium">注册日期</th>
                  <th className="text-right p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/20"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-input"
                      />
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || '未设置姓名'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.isBlocked && user.blockReason && (
                            <p className="text-xs text-red-600 flex items-center mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {user.blockReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    
                    <td className="p-4">
                      {getStatusBadge(user.isBlocked)}
                    </td>
                    
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <div>文章: {user._count.posts}</div>
                        <div>评论: {user._count.comments}</div>
                        <div>粉丝: {user._count.followers}</div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
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
                          {user.role === 'USER' ? (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUsers(new Set([user.id]))
                              handleBulkAction('promote')
                            }}>
                              <Shield className="h-4 w-4 mr-2" />
                              设为管理员
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUsers(new Set([user.id]))
                              handleBulkAction('demote')
                            }}>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              取消管理员
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {user.isBlocked ? (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUsers(new Set([user.id]))
                              handleBulkAction('unblock')
                            }}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              解封用户
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedUsers(new Set([user.id]))
                                setActionType('block')
                                setShowBlockDialog(true)
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              封禁用户
                            </DropdownMenuItem>
                          )}
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

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>封禁用户</DialogTitle>
            <DialogDescription>
              请输入封禁原因。被封禁的用户将无法登录和发表内容。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">封禁原因</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="请输入封禁原因..."
                className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBlockUsers} disabled={!blockReason.trim()}>
              确认封禁
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}