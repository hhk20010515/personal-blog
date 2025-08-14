'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Save, Shield, Mail, Globe, Database, Image, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  moderateComments: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  enableNotifications: boolean
  maintenanceMode: boolean
  analyticsId: string
  seoTitle: string
  seoDescription: string
  socialShareImage: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '个人博客',
    siteDescription: '分享技术、摄影和生活感悟的个人博客平台',
    siteUrl: 'https://yourdomain.com',
    contactEmail: 'hhk20010515@gmail.com',
    allowRegistration: true,
    requireEmailVerification: false,
    moderateComments: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'gif', 'webp', 'mp4', 'mov'],
    enableNotifications: true,
    maintenanceMode: false,
    analyticsId: '',
    seoTitle: '个人博客 - 技术、摄影与生活',
    seoDescription: '探索技术前沿，记录摄影之美，分享生活智慧',
    socialShareImage: '/og-image.png'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (status === 'unauthenticated' || !session || session.user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-screen">重定向中...</div>
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would make an API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log('Settings saved:', settings)
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error)
      // Show error message
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
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
                <h1 className="text-3xl font-bold">系统设置</h1>
                <p className="text-muted-foreground mt-2">
                  管理网站的全局设置和配置选项
                </p>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>保存中...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存设置
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">常规设置</TabsTrigger>
                <TabsTrigger value="security">安全设置</TabsTrigger>
                <TabsTrigger value="content">内容管理</TabsTrigger>
                <TabsTrigger value="integrations">集成服务</TabsTrigger>
                <TabsTrigger value="advanced">高级设置</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        网站基本信息
                      </CardTitle>
                      <CardDescription>
                        配置网站的基本信息和显示设置
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="siteName">网站名称</Label>
                          <Input
                            id="siteName"
                            value={settings.siteName}
                            onChange={(e) => updateSetting('siteName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siteUrl">网站地址</Label>
                          <Input
                            id="siteUrl"
                            value={settings.siteUrl}
                            onChange={(e) => updateSetting('siteUrl', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">网站描述</Label>
                        <Textarea
                          id="siteDescription"
                          value={settings.siteDescription}
                          onChange={(e) => updateSetting('siteDescription', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">联系邮箱</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={(e) => updateSetting('contactEmail', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>SEO设置</CardTitle>
                      <CardDescription>
                        优化网站在搜索引擎中的表现
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seoTitle">SEO标题</Label>
                        <Input
                          id="seoTitle"
                          value={settings.seoTitle}
                          onChange={(e) => updateSetting('seoTitle', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seoDescription">SEO描述</Label>
                        <Textarea
                          id="seoDescription"
                          value={settings.seoDescription}
                          onChange={(e) => updateSetting('seoDescription', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialShareImage">社交分享图片</Label>
                        <Input
                          id="socialShareImage"
                          value={settings.socialShareImage}
                          onChange={(e) => updateSetting('socialShareImage', e.target.value)}
                          placeholder="/og-image.png"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        用户注册与安全
                      </CardTitle>
                      <CardDescription>
                        管理用户注册和账户安全设置
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>允许用户注册</Label>
                          <p className="text-sm text-muted-foreground">
                            允许新用户通过注册页面创建账户
                          </p>
                        </div>
                        <Switch
                          checked={settings.allowRegistration}
                          onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>邮箱验证</Label>
                          <p className="text-sm text-muted-foreground">
                            要求用户验证邮箱后才能登录
                          </p>
                        </div>
                        <Switch
                          checked={settings.requireEmailVerification}
                          onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>评论审核</Label>
                          <p className="text-sm text-muted-foreground">
                            新评论需要管理员审核后才能显示
                          </p>
                        </div>
                        <Switch
                          checked={settings.moderateComments}
                          onCheckedChange={(checked) => updateSetting('moderateComments', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        系统维护
                      </CardTitle>
                      <CardDescription>
                        系统维护和紧急设置
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>维护模式</Label>
                          <p className="text-sm text-muted-foreground">
                            启用后普通用户将无法访问网站
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Content Management */}
              <TabsContent value="content">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        文件上传设置
                      </CardTitle>
                      <CardDescription>
                        管理文件上传的限制和配置
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxFileSize">最大文件大小 (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={settings.maxFileSize}
                          onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                          min="1"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>允许的文件类型</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['jpg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'doc', 'txt'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={type}
                                checked={settings.allowedFileTypes.includes(type)}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [...settings.allowedFileTypes, type]
                                    : settings.allowedFileTypes.filter(t => t !== type)
                                  updateSetting('allowedFileTypes', types)
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={type} className="text-sm">
                                .{type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        通知设置
                      </CardTitle>
                      <CardDescription>
                        配置系统通知和邮件设置
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>启用邮件通知</Label>
                          <p className="text-sm text-muted-foreground">
                            新评论、新用户等事件的邮件通知
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableNotifications}
                          onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations */}
              <TabsContent value="integrations">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Analytics</CardTitle>
                      <CardDescription>
                        连接Google Analytics跟踪网站数据
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="analyticsId">Analytics ID</Label>
                        <Input
                          id="analyticsId"
                          value={settings.analyticsId}
                          onChange={(e) => updateSetting('analyticsId', e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        邮件服务
                      </CardTitle>
                      <CardDescription>
                        SMTP邮件服务配置状态
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">SMTP服务器</p>
                              <p className="text-sm text-muted-foreground">smtp.gmail.com:587</p>
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 text-green-700 text-xs rounded">
                              已连接
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          测试邮件连接
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        数据库状态
                      </CardTitle>
                      <CardDescription>
                        数据库连接和备份状态
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">PostgreSQL (Neon)</p>
                              <p className="text-sm text-muted-foreground">ap-southeast-1.aws.neon.tech</p>
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 text-green-700 text-xs rounded">
                              正常运行
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            备份数据库
                          </Button>
                          <Button variant="outline" size="sm">
                            检查连接
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        危险操作
                      </CardTitle>
                      <CardDescription>
                        这些操作可能对网站造成不可逆的影响，请谨慎操作
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <h4 className="font-medium text-destructive mb-2">清除缓存</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          清除所有缓存数据，这可能会暂时影响网站性能
                        </p>
                        <Button variant="destructive" size="sm">
                          清除缓存
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <h4 className="font-medium text-destructive mb-2">重置设置</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          将所有设置恢复到默认值，此操作不可撤销
                        </p>
                        <Button variant="destructive" size="sm">
                          重置设置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>系统信息</CardTitle>
                      <CardDescription>
                        当前系统的版本和运行状态
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">系统版本</p>
                          <p className="font-medium">v1.0.0</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Node.js版本</p>
                          <p className="font-medium">18.17.0</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">数据库版本</p>
                          <p className="font-medium">PostgreSQL 15</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">最后更新</p>
                          <p className="font-medium">2025-01-13</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}