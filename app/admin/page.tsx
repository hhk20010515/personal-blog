'use client'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-muted-foreground">欢迎来到管理后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold">总文章数</h3>
          <p className="text-3xl font-bold mt-2">6</p>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold">总用户数</h3>
          <p className="text-3xl font-bold mt-2">1</p>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold">总浏览量</h3>
          <p className="text-3xl font-bold mt-2">125</p>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold">总点赞数</h3>
          <p className="text-3xl font-bold mt-2">15</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">管理功能</h2>
          <div className="space-y-3">
            <a href="/admin/posts" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              📝 文章管理
            </a>
            <a href="/admin/users" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              👥 用户管理
            </a>
            <a href="/admin/settings" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              ⚙️ 系统设置
            </a>
            <a href="/admin/newsletter" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              📧 邮件管理
            </a>
          </div>
        </div>

        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">快速操作</h2>
          <div className="space-y-3">
            <a href="/write" className="block p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-primary font-medium">
              ✍️ 写新文章
            </a>
            <a href="/posts" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              📖 查看网站
            </a>
            <div className="block p-3 bg-muted/50 rounded-lg">
              🎉 网站运行正常
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}