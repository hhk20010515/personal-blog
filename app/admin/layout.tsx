'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      // For testing, allow access even if not admin
      // router.push('/')
      // return
    }

    setIsAuthorized(true)
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized && status !== 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">访问受限</h1>
          <p className="text-muted-foreground mb-4">您需要管理员权限才能访问此页面</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            登录
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (status === 'unauthenticated' || !session || session.user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-screen">重定向中...</div>
  }

  // Create mock user for now to fix build
  const user = {
    id: 'admin',
    name: session.user.name || 'Administrator',
    email: session.user.email || '',
    image: session.user.image || null,
    role: 'ADMIN'
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader user={user} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}