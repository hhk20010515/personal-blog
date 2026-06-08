'use client'

import { useCallback, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Eye, 
	  MousePointer,
	  Plus,
	  Edit3,
	  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface Newsletter {
  id: string
  title: string
  subject: string
  content: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT'
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  recipients: number
  opens?: number
  clicks?: number
}

interface Subscriber {
  id: string
  email: string
  name?: string
  subscribed: boolean
  subscribedAt: string
  tags: string[]
}

export default function AdminNewsletterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

	  const [newNewsletter, setNewNewsletter] = useState({
	    title: '',
	    subject: '',
	    content: ''
	  })

  const resetNewsletterForm = () => {
    setNewNewsletter({ title: '', subject: '', content: '' })
    setEditingId(null)
    setIsCreating(false)
  }

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  const loadNewsletters = useCallback(async () => {
    const response = await fetch('/api/newsletters')
    if (!response.ok) return

    const data = await response.json()
    setNewsletters(data.newsletters)
  }, [])

  const loadSubscribers = useCallback(async () => {
      const response = await fetch('/api/newsletter/subscribe')
      if (!response.ok) return

      const data = await response.json()
      setSubscribers(data.subscribers.map((subscriber: any) => ({
        id: subscriber.id,
        email: subscriber.email,
        subscribed: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt,
        tags: subscriber.preferences?.categories || [],
      })))
  }, [])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadNewsletters()
      loadSubscribers()
    }
  }, [session, loadNewsletters, loadSubscribers])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (status === 'unauthenticated' || !session || session.user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-screen">重定向中...</div>
  }

  const getStatusBadge = (status: Newsletter['status']) => {
    switch (status) {
      case 'SENT':
        return <Badge className="bg-green-500">已发送</Badge>
      case 'SCHEDULED':
        return <Badge className="bg-blue-500">已安排</Badge>
      case 'DRAFT':
        return <Badge variant="outline">草稿</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

	  const totalSubscribers = subscribers.filter(s => s.subscribed).length
	  const totalSent = newsletters.filter(n => n.status === 'SENT').length
  const monthlyNewSubscribers = subscribers.filter((subscriber) => {
    const subscribedAt = new Date(subscriber.subscribedAt)
    const now = new Date()
    return (
      subscribedAt.getFullYear() === now.getFullYear() &&
      subscribedAt.getMonth() === now.getMonth()
    )
  }).length
	  const avgOpenRate = newsletters
    .filter(n => n.status === 'SENT' && n.opens && n.recipients)
    .reduce((acc, n) => acc + (n.opens! / n.recipients), 0) / totalSent || 0

	  const handleSaveNewsletter = async () => {
    if (!newNewsletter.title.trim() || !newNewsletter.subject.trim() || !newNewsletter.content.trim()) {
      toast({
        title: '请填写完整内容',
        description: '标题、主题和正文不能为空',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

	    try {
	      const response = await fetch(editingId ? `/api/newsletters/${editingId}` : '/api/newsletters', {
	        method: editingId ? 'PATCH' : 'POST',
	        headers: {
	          'Content-Type': 'application/json',
	        },
	        body: JSON.stringify(newNewsletter),
	      })

      if (!response.ok) {
        throw new Error('Create newsletter failed')
      }

	      const newsletter = await response.json()
	      setNewsletters((current) =>
	        editingId
	          ? current.map((item) => (item.id === editingId ? newsletter : item))
	          : [newsletter, ...current]
	      )
	      resetNewsletterForm()
	      toast({ title: editingId ? '通讯已更新' : '草稿已创建' })
    } catch (error) {
      toast({
        title: '创建失败',
        description: '无法创建邮件通讯，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendNewsletter = async (newsletterId: string) => {
    setSendingId(newsletterId)

    try {
      const response = await fetch(`/api/newsletters/${newsletterId}/send`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Send newsletter failed')
      }

      setNewsletters((current) =>
        current.map((newsletter) =>
          newsletter.id === newsletterId ? data.newsletter : newsletter
        )
      )
      toast({
        title: '发送完成',
        description: `成功发送给 ${data.sentCount} 个订阅者`,
      })
    } catch (error: any) {
      toast({
        title: '发送失败',
        description: error.message || '请检查 SMTP 配置后重试',
        variant: 'destructive',
      })
    } finally {
      setSendingId(null)
    }
  }

	  const handleDeleteNewsletter = async (newsletterId: string) => {
    if (!confirm('确定删除这封邮件通讯吗？')) return

    const response = await fetch(`/api/newsletters/${newsletterId}`, {
      method: 'DELETE',
    })

	    if (response.ok) {
	      setNewsletters(newsletters.filter((newsletter) => newsletter.id !== newsletterId))
	      toast({ title: '已删除' })
		  }
  }

	  const handleToggleSubscriber = async (subscriber: Subscriber) => {
    try {
      const response = subscriber.subscribed
        ? await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(subscriber.email)}`, {
            method: 'DELETE',
          })
        : await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: subscriber.email,
              preferences: {
                categories: subscriber.tags,
              },
            }),
          })

      if (!response.ok) {
        throw new Error('Update subscriber failed')
      }

      setSubscribers((current) =>
        current.map((item) =>
          item.id === subscriber.id ? { ...item, subscribed: !subscriber.subscribed } : item
        )
      )
      toast({ title: subscriber.subscribed ? '已退订' : '已重新订阅' })
    } catch (error) {
      toast({
        title: '操作失败',
        description: '无法更新订阅状态',
        variant: 'destructive',
      })
    }
	  }

	  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">邮件通讯</h1>
                <p className="text-muted-foreground mt-2">
                  管理邮件订阅和发送通讯给用户
                </p>
              </div>
	              <Button
	                onClick={() => {
	                  setEditingId(null)
	                  setNewNewsletter({ title: '', subject: '', content: '' })
	                  setIsCreating(true)
	                }}
	              >
                <Plus className="h-4 w-4 mr-2" />
                创建通讯
              </Button>
            </div>

            {/* Newsletter Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">订阅者</p>
                      <p className="text-2xl font-bold">{totalSubscribers}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">已发送</p>
                      <p className="text-2xl font-bold">{totalSent}</p>
                    </div>
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">平均打开率</p>
                      <p className="text-2xl font-bold">{(avgOpenRate * 100).toFixed(1)}%</p>
                    </div>
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
	                      <p className="text-sm text-muted-foreground">本月新增</p>
	                      <p className="text-2xl font-bold">{monthlyNewSubscribers}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="newsletters" className="space-y-6">
	                <TabsList>
	                  <TabsTrigger value="newsletters">邮件列表</TabsTrigger>
	                  <TabsTrigger value="subscribers">订阅管理</TabsTrigger>
	                </TabsList>

              {/* Newsletters Tab */}
              <TabsContent value="newsletters">
                <Card>
                  <CardHeader>
                    <CardTitle>邮件通讯</CardTitle>
                    <CardDescription>
                      管理和发送邮件通讯给订阅用户
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCreating && (
                      <div className="mb-6 p-6 border border-dashed rounded-lg">
	                        <h3 className="text-lg font-semibold mb-4">
	                          {editingId ? '编辑通讯' : '创建新通讯'}
	                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>标题</Label>
                            <Input
                              value={newNewsletter.title}
                              onChange={(e) => setNewNewsletter(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="邮件通讯标题"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>邮件主题</Label>
                            <Input
                              value={newNewsletter.subject}
                              onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                              placeholder="邮件主题行"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>内容</Label>
                            <Textarea
                              value={newNewsletter.content}
                              onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="邮件内容..."
                              rows={6}
                            />
                          </div>
	                          <div className="flex gap-2">
	                            <Button onClick={handleSaveNewsletter} disabled={isSaving}>
	                              {isSaving ? '保存中...' : editingId ? '保存修改' : '创建草稿'}
	                            </Button>
	                            <Button variant="outline" onClick={resetNewsletterForm}>
	                              取消
	                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

	                    <div className="space-y-4">
	                      {newsletters.length === 0 && (
	                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
	                          暂无邮件通讯
	                        </div>
	                      )}
	                      {newsletters.map((newsletter) => (
                        <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{newsletter.title}</h4>
                              {getStatusBadge(newsletter.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{newsletter.subject}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(newsletter.createdAt)}
                              </span>
                              {newsletter.status === 'SENT' && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {newsletter.recipients} 收件人
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {newsletter.opens} 打开
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MousePointer className="h-3 w-3" />
                                    {newsletter.clicks} 点击
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {newsletter.status === 'DRAFT' && (
                              <>
	                                <Button
	                                  size="sm"
	                                  variant="outline"
	                                  onClick={() => {
	                                    setEditingId(newsletter.id)
	                                    setNewNewsletter({
	                                      title: newsletter.title,
	                                      subject: newsletter.subject,
	                                      content: newsletter.content,
	                                    })
	                                    setIsCreating(true)
	                                  }}
	                                >
	                                  <Edit3 className="h-4 w-4 mr-1" />
	                                  编辑
	                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSendNewsletter(newsletter.id)}
                                  disabled={sendingId === newsletter.id}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {sendingId === newsletter.id ? '发送中' : '发送'}
                                </Button>
                              </>
                            )}
	                            {newsletter.status === 'SCHEDULED' && (
	                              <Button
	                                size="sm"
	                                variant="outline"
	                                onClick={() => {
	                                  setEditingId(newsletter.id)
	                                  setNewNewsletter({
	                                    title: newsletter.title,
	                                    subject: newsletter.subject,
	                                    content: newsletter.content,
	                                  })
	                                  setIsCreating(true)
	                                }}
	                              >
	                                编辑计划
	                              </Button>
	                            )}
	                            <Button size="sm" variant="ghost" onClick={() => handleDeleteNewsletter(newsletter.id)}>
	                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscribers Tab */}
              <TabsContent value="subscribers">
                <Card>
                  <CardHeader>
                    <CardTitle>订阅者管理</CardTitle>
                    <CardDescription>
                      查看和管理邮件订阅用户
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
	                    <div className="space-y-4">
	                      {subscribers.length === 0 && (
	                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
	                          暂无订阅者
	                        </div>
	                      )}
	                      {subscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{subscriber.name || subscriber.email}</span>
                              {subscriber.subscribed ? (
                                <Badge className="bg-green-500">已订阅</Badge>
                              ) : (
                                <Badge variant="outline">已退订</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{subscriber.email}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                订阅时间: {formatDate(subscriber.subscribedAt)}
                              </span>
                              <div className="flex gap-1">
                                {subscriber.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
	                          <div className="flex gap-2">
	                            {subscriber.subscribed ? (
	                              <Button
	                                size="sm"
	                                variant="ghost"
	                                onClick={() => handleToggleSubscriber(subscriber)}
	                              >
	                                退订
	                              </Button>
	                            ) : (
	                              <Button size="sm" onClick={() => handleToggleSubscriber(subscriber)}>
	                                重新订阅
	                              </Button>
	                            )}
	                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
	            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
