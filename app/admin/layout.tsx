import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Redirect if not authenticated or not admin
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin')
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