import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect if not authenticated or not admin
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin')
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