'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, Mail, Shield } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

const preferenceOptions = [
  { id: 'photography', label: '摄影' },
  { id: 'tech', label: '技术' },
  { id: 'life', label: '生活' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['photography'])
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const email = session?.user?.email || ''

  const loadSubscription = useCallback(async () => {
    if (!email) return

    const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(email)}`)

    if (!response.ok) {
      setLoaded(true)
      return
    }

    const data = await response.json()
    const subscriber = data.subscriber
    const categories = subscriber?.preferences?.categories

    setIsSubscribed(Boolean(subscriber?.isActive))
    if (Array.isArray(categories) && categories.length > 0) {
      setSelectedCategories(categories)
    }
    setLoaded(true)
  }, [email])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/settings')
    }

    if (status === 'authenticated') {
      loadSubscription()
    }
  }, [status, router, loadSubscription])

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category)
      }

      return [...current, category]
    })
  }

  const handleSave = async () => {
    if (!email) return

    setSaving(true)

    try {
      const response = isSubscribed
        ? await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              preferences: {
                categories: selectedCategories,
                digestFrequency: 'weekly',
              },
            }),
          })
        : await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(email)}`, {
            method: 'DELETE',
          })

      if (!response.ok) {
        throw new Error('Save subscription settings failed')
      }

      toast({ title: '设置已保存' })
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || !session || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">设置</h1>
            <p className="text-muted-foreground mt-2">管理账户状态和邮件订阅偏好</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                账户
              </CardTitle>
              <CardDescription>当前登录身份</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium">{session.user?.name || email}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <Badge variant={session.user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                {session.user?.role === 'ADMIN' ? '管理员' : '普通用户'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                邮件订阅
              </CardTitle>
              <CardDescription>选择是否接收站点更新</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="newsletter">接收邮件通讯</Label>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Switch
                  id="newsletter"
                  checked={isSubscribed}
                  onCheckedChange={setIsSubscribed}
                />
              </div>

              <div className="space-y-3">
                <Label>关注分类</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {preferenceOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 rounded-lg border p-4 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(option.id)}
                        onChange={() => toggleCategory(option.id)}
                        disabled={!isSubscribed}
                        className="h-4 w-4 rounded border-input"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
