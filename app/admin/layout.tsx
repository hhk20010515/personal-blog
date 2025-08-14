'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">需要登录</h1>
          <p className="text-muted-foreground mb-4">请先登录以访问管理后台</p>
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

  // Create mock user for admin interface
  const user = {
    id: session?.user?.id || 'admin',
    name: session?.user?.name || 'Administrator',
    email: session?.user?.email || '',
    image: session?.user?.image || null,
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