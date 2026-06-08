'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyRequest() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Luce'

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

          {/* Mail icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="h-10 w-10 text-primary" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-4">检查您的邮箱</h1>
            <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
              我们已经向您的邮箱发送了一个登录链接。
              <br />
              请点击邮件中的链接完成登录。
            </p>

            {/* Tips */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-3 text-center">提示</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  登录链接24小时内有效
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  如果没有收到邮件，请检查垃圾邮件文件夹
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  可以关闭此页面，从邮件中直接登录
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/auth/signin">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新发送邮件
                </Link>
              </Button>
              
              <Button asChild size="lg" className="w-full">
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
              遇到问题？{' '}
              <Link href="/contact" className="text-primary hover:underline">
                联系我们
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
