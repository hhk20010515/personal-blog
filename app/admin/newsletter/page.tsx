'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
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
  FileText,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Newsletter {
  id: string
  title: string
  subject: string
  content: string
  status: 'draft' | 'scheduled' | 'sent'
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

const mockNewsletters: Newsletter[] = [
  {
    id: '1',
    title: '2025年1月技术趋势回顾',
    subject: 'GPT-5发布，AI技术新突破 | 月度技术回顾',
    content: '本月我们见证了GPT-5的正式发布...',
    status: 'sent',
    createdAt: '2025-01-10T10:00:00Z',
    sentAt: '2025-01-10T18:00:00Z',
    recipients: 1250,
    opens: 890,
    clicks: 156
  },
  {
    id: '2',
    title: '摄影技巧分享专刊',
    subject: '街头摄影的7个秘密技巧',
    content: '今天分享一些街头摄影的实用技巧...',
    status: 'scheduled',
    createdAt: '2025-01-12T14:00:00Z',
    scheduledAt: '2025-01-15T09:00:00Z',
    recipients: 1250
  },
  {
    id: '3',
    title: '生活感悟与正念练习',
    subject: '在快节奏生活中寻找内心平静',
    content: '分享一些正念练习的方法...',
    status: 'draft',
    createdAt: '2025-01-13T11:00:00Z',
    recipients: 0
  }
]

const mockSubscribers: Subscriber[] = [
  {
    id: '1',
    email: 'user1@example.com',
    name: '张三',
    subscribed: true,
    subscribedAt: '2025-01-01T10:00:00Z',
    tags: ['技术', '摄影']
  },
  {
    id: '2',
    email: 'user2@example.com',
    name: '李四',
    subscribed: true,
    subscribedAt: '2024-12-15T15:30:00Z',
    tags: ['生活', '哲学']
  },
  {
    id: '3',
    email: 'user3@example.com',
    subscribed: false,
    subscribedAt: '2024-11-20T09:15:00Z',
    tags: ['技术']
  }
]

export default function AdminNewsletterPage() {
  const { data: session, status } = useSession()
  const [newsletters, setNewsletters] = useState<Newsletter[]>(mockNewsletters)
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)

  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    subject: '',
    content: ''
  })

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const getStatusBadge = (status: Newsletter['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">已发送</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-500">已安排</Badge>
      case 'draft':
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
  const totalSent = newsletters.filter(n => n.status === 'sent').length
  const avgOpenRate = newsletters
    .filter(n => n.status === 'sent' && n.opens && n.recipients)
    .reduce((acc, n) => acc + (n.opens! / n.recipients), 0) / totalSent || 0

  const handleCreateNewsletter = () => {
    // In real app, this would make an API call
    const newsletter: Newsletter = {
      id: Date.now().toString(),
      ...newNewsletter,
      status: 'draft',
      createdAt: new Date().toISOString(),
      recipients: 0
    }
    setNewsletters([newsletter, ...newsletters])
    setNewNewsletter({ title: '', subject: '', content: '' })
    setIsCreating(false)
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
              <Button onClick={() => setIsCreating(true)}>
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
                      <p className="text-sm text-muted-foreground">本月增长</p>
                      <p className="text-2xl font-bold">+12%</p>
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
                <TabsTrigger value="templates">邮件模板</TabsTrigger>
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
                        <h3 className="text-lg font-semibold mb-4">创建新通讯</h3>
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
                            <Button onClick={handleCreateNewsletter}>
                              创建草稿
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                              取消
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
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
                              {newsletter.status === 'sent' && (
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
                            {newsletter.status === 'draft' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  编辑
                                </Button>
                                <Button size="sm">
                                  <Send className="h-4 w-4 mr-1" />
                                  发送
                                </Button>
                              </>
                            )}
                            {newsletter.status === 'scheduled' && (
                              <Button size="sm" variant="outline">
                                编辑计划
                              </Button>
                            )}
                            {newsletter.status === 'sent' && (
                              <Button size="sm" variant="outline">
                                查看报告
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
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
                            <Button size="sm" variant="outline">
                              编辑
                            </Button>
                            {subscriber.subscribed ? (
                              <Button size="sm" variant="ghost">
                                退订
                              </Button>
                            ) : (
                              <Button size="sm">
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

              {/* Templates Tab */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle>邮件模板</CardTitle>
                    <CardDescription>
                      创建和管理邮件模板，提高发送效率
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="border border-dashed rounded-lg p-6 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <h4 className="font-medium mb-2">创建新模板</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          创建可重用的邮件模板
                        </p>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          创建模板
                        </Button>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">技术周报模板</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          用于技术内容的周报邮件模板
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                          <Button size="sm">
                            使用
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">摄影分享模板</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          用于摄影作品分享的邮件模板
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                          <Button size="sm">
                            使用
                          </Button>
                        </div>
                      </div>
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