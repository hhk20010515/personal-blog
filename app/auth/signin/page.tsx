'use client'

import { useEffect, useState, Suspense } from 'react'
import { getProviders, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Chrome, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [providers, setProviders] = useState<Record<string, any> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  const error = searchParams?.get('error')
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kai 的摄影博客'

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      })
      
      if (result?.ok) {
        setEmailSent(true)
        toast({
          title: "邮件已发送",
          description: "请检查您的邮箱并点击登录链接。",
        })
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后再试或联系管理员。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      toast({
        title: "登录失败",
        description: "请稍后再试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return '第三方登录服务出现错误'
      case 'OAuthCallback':
        return '第三方登录回调出现错误'
      case 'OAuthCreateAccount':
        return '无法创建第三方登录账户'
      case 'EmailCreateAccount':
        return '无法创建邮箱登录账户'
      case 'Callback':
        return '登录回调出现错误'
      case 'OAuthAccountNotLinked':
        return '此邮箱已使用其他登录方式注册，请使用正确的登录方式'
      case 'EmailSignin':
        return '无法发送登录邮件'
      case 'CredentialsSignin':
        return '登录凭据无效'
      case 'SessionRequired':
        return '需要登录才能访问此页面'
      case 'AccessDenied':
        return '访问被拒绝，您可能已被禁用'
      default:
        return '登录出现未知错误'
    }
  }

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

        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold gradient-text">{siteName}</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">欢迎回来</h1>
            <p className="text-foreground/60">选择您的登录方式</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-destructive font-medium">登录失败</p>
                <p className="text-sm text-destructive/80 mt-1">{getErrorMessage(error)}</p>
              </div>
            </motion.div>
          )}

          {/* Email sent confirmation */}
          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">检查您的邮箱</h2>
              <p className="text-foreground/60 mb-6">
                我们已向 <span className="font-medium">{email}</span> 发送了登录链接
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
              >
                使用其他邮箱
              </Button>
            </motion.div>
          ) : (
            <>
              {/* OAuth Providers */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-6"
              >
                {providers?.google && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <Chrome className="h-5 w-5 mr-3" />
                    使用 Google 登录
                  </Button>
                )}

                {providers?.wechat && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('wechat')}
                    disabled={isLoading}
                  >
                    <MessageCircle className="h-5 w-5 mr-3" />
                    使用微信登录
                  </Button>
                )}
              </motion.div>

              {/* Divider */}
              {providers?.email && (providers.google || providers.wechat) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-foreground/60">或</span>
                  </div>
                </motion.div>
              )}

              {/* Email form */}
              {providers?.email && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onSubmit={handleEmailSignIn}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="sr-only">
                      邮箱地址
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background/50 backdrop-blur text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="输入您的邮箱地址"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !email.trim()}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    {isLoading ? '发送中...' : '发送登录链接'}
                  </Button>
                </motion.form>
              )}

              {providers && !providers.google && !providers.wechat && !providers.email && (
                <p className="text-center text-sm text-muted-foreground">
                  当前没有可用的登录方式，请检查服务端认证环境变量。
                </p>
              )}
            </>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-sm text-foreground/60"
          >
            <p>
              继续即表示您同意我们的{' '}
              <Link href="/terms" className="text-primary hover:underline">
                服务条款
              </Link>
              {' '}和{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                隐私政策
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <SignInContent />
    </Suspense>
  )
}
