import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">管理后台</h1>
          <nav className="mt-4 space-x-4">
            <a href="/admin" className="text-blue-600 hover:underline">仪表盘</a>
            <a href="/admin/posts" className="text-blue-600 hover:underline">文章管理</a>
            <a href="/admin/users" className="text-blue-600 hover:underline">用户管理</a>
            <a href="/admin/settings" className="text-blue-600 hover:underline">设置</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
