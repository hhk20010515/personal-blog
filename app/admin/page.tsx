import { getDashboardStats } from '@/lib/db'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">仪表盘</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold">总文章数</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold">总用户数</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold">总浏览量</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">快速操作</h3>
        <div className="space-y-2">
          <a href="/admin/posts" className="block bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
            📝 管理文章
          </a>
          <a href="/admin/users" className="block bg-green-500 text-white p-3 rounded hover:bg-green-600">
            👥 管理用户  
          </a>
          <a href="/write" className="block bg-purple-500 text-white p-3 rounded hover:bg-purple-600">
            ✍️ 写新文章
          </a>
        </div>
      </div>
    </div>
  )
}
