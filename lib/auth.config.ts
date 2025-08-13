import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { sendVerificationRequest } from '@/lib/email'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // WeChat OAuth provider (custom implementation)
    {
      id: 'wechat',
      name: 'WeChat',
      type: 'oauth',
      authorization: {
        url: 'https://open.weixin.qq.com/connect/qrconnect',
        params: {
          appid: process.env.WECHAT_APP_ID,
          redirect_uri: process.env.NEXTAUTH_URL + '/api/auth/callback/wechat',
          response_type: 'code',
          scope: 'snsapi_login',
          state: 'STATE',
        },
      },
      token: {
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        async request({ params }) {
          const response = await fetch(
            `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${params.code}&grant_type=authorization_code`
          )
          return await response.json()
        },
      },
      userinfo: {
        url: 'https://api.weixin.qq.com/sns/userinfo',
        async request({ tokens }) {
          const response = await fetch(
            `https://api.weixin.qq.com/sns/userinfo?access_token=${tokens.access_token}&openid=${tokens.openid}&lang=zh_CN`
          )
          return await response.json()
        },
      },
      profile(profile: any) {
        return {
          id: profile.openid,
          name: profile.nickname,
          email: `${profile.openid}@wechat.local`, // Dummy email for WeChat users
          image: profile.headimgurl,
        } as any
      },
      style: {
        logo: '/wechat-logo.svg',
        logoDark: '/wechat-logo.svg',
        bg: '#07C160',
        text: '#fff',
        bgDark: '#07C160',
        textDark: '#fff',
      },
    },
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add user role and other properties
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            isBlocked: true,
            createdAt: true,
          },
        })
        session.user.role = userData?.role || 'USER'
        session.user.isBlocked = userData?.isBlocked || false
        session.user.createdAt = userData?.createdAt || new Date()
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Check if user is blocked
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        
        if (existingUser?.isBlocked) {
          return false
        }
      }
      
      return true
    },
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.id)
      
      // 检查是否是第一个用户，如果是则设为管理员
      const userCount = await prisma.user.count()
      if (userCount === 1 || user.email === 'hhk20010515@gmail.com') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        })
        console.log('设置为管理员:', user.email)
      }
    },
  },
  session: {
    strategy: 'database',
  },
  debug: process.env.NODE_ENV === 'development',
}