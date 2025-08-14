'use client'

// Force dynamic rendering for admin layout
export const dynamic = 'force-dynamic'

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
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
      router.push('/auth/signin?callbackUrl=/admin')
    }
  }, [status, session, router])

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