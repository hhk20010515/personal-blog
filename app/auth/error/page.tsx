'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errorMessages = {
  Configuration: {
    title: '服务器配置错误',
    description: '认证服务配置有误，请联系管理员。',
    action: '联系管理员'
  },
  AccessDenied: {
    title: '访问被拒绝',
    description: '您没有权限登录此应用，或者您的账户已被禁用。',
    action: '联系管理员'
  },
  Verification: {
    title: '验证失败',
    description: '登录链接已过期或无效，请重新获取登录链接。',
    action: '重新登录'
  },
  Default: {
    title: '登录失败',
    description: '登录过程中发生了未知错误，请稍后重试。',
    action: '重新尝试'
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error') as keyof typeof errorMessages
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Luce'

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </motion.div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold gradient-text">{siteName}</span>
            </Link>
          </motion.div>

          {/* Error icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="h-10 w-10 text-destructive" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-4 text-destructive">
              {errorInfo.title}
            </h1>
            <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
              {errorInfo.description}
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-muted/30 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold mb-2 text-center">错误详情 (开发模式)</h3>
                <code className="text-sm text-foreground/70 break-all">
                  Error: {error}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {error === 'Verification' || !error ? (
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/signin">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {errorInfo.action}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/contact">
                    {errorInfo.action}
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/">
                  返回首页
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-foreground/60"
          >
            <p>
              如果问题持续存在，请{' '}
              <Link href="/contact" className="text-primary hover:underline">
                联系我们
              </Link>
              {' '}寻求帮助
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
