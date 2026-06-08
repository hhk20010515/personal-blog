'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Menu, X, Search, User, LogOut, Settings, PenTool, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigation = [
  { name: '首页', href: '/' },
  { name: '摄影', href: '/photography' },
  { name: '器材测评', href: '/gear' },
  { name: '技术', href: '/tech' },
  { name: '文章', href: '/posts' },
  { name: '关于', href: '/about' },
]
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Luce'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [locale, setLocale] = useState<'zh' | 'en'>('zh')
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const savedLocale = window.localStorage.getItem('luce-locale')
    if (savedLocale === 'en') {
      setLocale('en')
      document.documentElement.lang = 'en'
    }
  }, [])

  const toggleLocale = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    setLocale(nextLocale)
    window.localStorage.setItem('luce-locale', nextLocale)
    document.documentElement.lang = nextLocale === 'en' ? 'en' : 'zh-CN'
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) {
      router.push('/search')
      return
    }
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full border-b transition-all duration-300',
        isScrolled
          ? 'border-cyan-300/20 bg-[#05070c]/85 py-2 shadow-[0_12px_50px_rgba(0,229,255,0.08)] backdrop-blur-xl'
          : 'border-cyan-300/10 bg-[#05070c]/70 py-3 backdrop-blur-xl'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <span className="h-2.5 w-2.5 bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.9)]" />
              <span className="text-2xl font-semibold tracking-[0.18em] text-white">
                {siteName}
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-7">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white/66 transition-colors duration-200 hover:text-cyan-100"
              >
                {locale === 'en' ? translateNav(item.name) : item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/45" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={locale === 'en' ? 'Search' : '搜索'}
                  className="h-9 w-44 border border-white/10 bg-white/[0.06] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:w-56 focus:border-cyan-300/50 focus:bg-cyan-300/[0.08]"
                />
              </div>
            </form>

            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 px-2 text-white/70 hover:text-cyan-100 sm:flex"
              onClick={toggleLocale}
            >
              <Languages className="h-4 w-4" />
              {locale === 'en' ? '中文' : 'EN'}
            </Button>

            {/* Auth */}
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={session.user?.image || ''} 
                        alt={session.user?.name || 'User'} 
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      个人资料
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/write" className="flex items-center">
                        <PenTool className="mr-2 h-4 w-4" />
                        写文章
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onSelect={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn()} size="sm" className="border border-cyan-300/25 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/20">
                {locale === 'en' ? 'Sign in' : '登录'}
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 border-t border-cyan-300/10 pb-4 lg:hidden"
            >
              <form onSubmit={submitSearch} className="pt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/45" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={locale === 'en' ? 'Search posts and gear reviews' : '搜索文章和器材测评'}
                    className="h-11 w-full border border-white/10 bg-white/[0.06] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-300/50"
                  />
                </div>
              </form>

              <div className="flex flex-col space-y-4 pt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-cyan-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {locale === 'en' ? translateNav(item.name) : item.name}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="flex items-center gap-2 py-2 text-left text-sm font-medium text-white/70 hover:text-cyan-100"
                >
                  <Languages className="h-4 w-4" />
                  {locale === 'en' ? '切换中文' : 'English'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

function translateNav(name: string) {
  const labels: Record<string, string> = {
    首页: 'Home',
    摄影: 'Photography',
    器材测评: 'Gear',
    技术: 'Tech',
    文章: 'Posts',
    关于: 'About',
  }
  return labels[name] || name
}
