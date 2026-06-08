'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bookmark, Heart, MapPin, MessageCircle, PenLine, UserRound } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  bio: string | null
  website: string | null
  location: string | null
  twitterHandle: string | null
  githubHandle: string | null
  role: string
  createdAt: string
  _count: {
    posts: number
    comments: number
    likes: number
    bookmarks: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
    twitterHandle: '',
    githubHandle: '',
  })

  const loadProfile = useCallback(async () => {
    const response = await fetch('/api/users/me')

    if (!response.ok) {
      toast({
        title: '资料加载失败',
        description: '请刷新页面后重试',
        variant: 'destructive',
      })
      return
    }

    const data = await response.json()
    setProfile(data)
    setForm({
      name: data.name || '',
      bio: data.bio || '',
      website: data.website || '',
      location: data.location || '',
      twitterHandle: data.twitterHandle || '',
      githubHandle: data.githubHandle || '',
    })
  }, [toast])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile')
    }

    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, router, loadProfile])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Update profile failed')
      }

      const data = await response.json()
      setProfile(data)
      toast({ title: '资料已更新' })
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请检查输入后重试',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const stats = profile
    ? [
        { label: '文章', value: profile._count.posts, icon: PenLine },
        { label: '评论', value: profile._count.comments, icon: MessageCircle },
        { label: '点赞', value: profile._count.likes, icon: Heart },
        { label: '收藏', value: profile._count.bookmarks, icon: Bookmark },
      ]
    : []

  if (status === 'loading' || !session || !profile) {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.image || ''} alt={profile.name || 'User'} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold">{profile.name || profile.email}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                  {profile.location && (
                    <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {stats.map((stat) => {
                      const Icon = stat.icon
                      return (
                        <div key={stat.label} className="rounded-lg border p-3">
                          <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="font-semibold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5" />
                    个人资料
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">显示名称</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">位置</Label>
                      <Input
                        id="location"
                        value={form.location}
                        onChange={(event) => updateField('location', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">简介</Label>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(event) => updateField('bio', event.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">网站</Label>
                    <Input
                      id="website"
                      type="url"
                      value={form.website}
                      onChange={(event) => updateField('website', event.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitterHandle">Twitter</Label>
                      <Input
                        id="twitterHandle"
                        value={form.twitterHandle}
                        onChange={(event) => updateField('twitterHandle', event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="githubHandle">GitHub</Label>
                      <Input
                        id="githubHandle"
                        value={form.githubHandle}
                        onChange={(event) => updateField('githubHandle', event.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? '保存中...' : '保存资料'}
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
