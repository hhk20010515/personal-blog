'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Image,
  Tags,
  FolderOpen,
  Settings,
  BarChart3,
  Mail,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: '仪表盘',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: '文章管理',
    href: '/admin/posts',
    icon: FileText,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '评论管理',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    name: '媒体库',
    href: '/admin/media',
    icon: Image,
  },
  {
    name: '分类标签',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    name: '数据分析',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: '邮件订阅',
    href: '/admin/newsletter',
    icon: Mail,
  },
  {
    name: '系统设置',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-background border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text">管理后台</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link 
          href="/" 
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回网站
        </Link>
      </div>
    </div>
  )
}