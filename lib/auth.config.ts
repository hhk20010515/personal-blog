import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import type { OAuthConfig } from 'next-auth/providers/oauth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { sendVerificationRequest } from '@/lib/email'

interface WeChatProfile {
  openid: string
  unionid?: string
  nickname?: string
  headimgurl?: string
}

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || 'hhk20010515@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

const providers: AuthOptions['providers'] = []

function WeChatProvider({
  clientId,
  clientSecret,
}: {
  clientId: string
  clientSecret: string
}): OAuthConfig<WeChatProfile> {
  return {
    id: 'wechat',
    name: 'WeChat',
    type: 'oauth',
    checks: ['state'],
    authorization: {
      url: 'https://open.weixin.qq.com/connect/qrconnect',
      params: {
        appid: clientId,
        response_type: 'code',
        scope: 'snsapi_login',
      },
    },
    token: {
      async request({ params }) {
        const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
        tokenUrl.searchParams.set('appid', clientId)
        tokenUrl.searchParams.set('secret', clientSecret)
        tokenUrl.searchParams.set('code', String(params.code))
        tokenUrl.searchParams.set('grant_type', 'authorization_code')

        const response = await fetch(tokenUrl)
        const tokens = await response.json()

        if (!response.ok || tokens.errcode) {
          throw new Error(tokens.errmsg || 'WeChat token request failed')
        }

        return { tokens }
      },
    },
    userinfo: {
      async request({ tokens }) {
        const accessToken = tokens.access_token
        const openid = (tokens as any).openid

        if (!accessToken || !openid) {
          throw new Error('WeChat userinfo request is missing token or openid')
        }

        const userinfoUrl = new URL('https://api.weixin.qq.com/sns/userinfo')
        userinfoUrl.searchParams.set('access_token', String(accessToken))
        userinfoUrl.searchParams.set('openid', String(openid))
        userinfoUrl.searchParams.set('lang', 'zh_CN')

        const response = await fetch(userinfoUrl)
        const profile = await response.json()

        if (!response.ok || profile.errcode) {
          throw new Error(profile.errmsg || 'WeChat userinfo request failed')
        }

        return profile
      },
    },
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname || '微信用户',
        email: null,
        image: profile.headimgurl || null,
        role: 'USER',
        isBlocked: false,
        createdAt: new Date(),
      }
    },
    clientId,
    clientSecret,
  }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET) {
  providers.push(
    WeChatProvider({
      clientId: process.env.WECHAT_APP_ID,
      clientSecret: process.env.WECHAT_APP_SECRET,
    })
  )
}

if (
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_FROM
) {
  providers.push(
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
    })
  )
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.role = token.role || 'USER'
        session.user.isBlocked = Boolean(token.isBlocked)
        session.user.createdAt = token.createdAt ? new Date(token.createdAt as string) : new Date()
      }
      return session
    },
    async jwt({ token, user }) {
      const email = (user?.email || token.email || '').toLowerCase()
      const userId = user?.id || token.sub

      if (email || userId) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
          select: {
            id: true,
            email: true,
            role: true,
            isBlocked: true,
            createdAt: true,
          },
        })

        if (dbUser) {
          const dbEmail = dbUser.email?.toLowerCase()
          const desiredRole = dbEmail && adminEmails.has(dbEmail) ? 'ADMIN' : dbUser.role

          if (desiredRole !== dbUser.role) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: desiredRole },
            })
          }

          token.sub = dbUser.id
          token.role = desiredRole
          token.isBlocked = dbUser.isBlocked
          token.createdAt = dbUser.createdAt.toISOString()
        } else {
          token.role = email && adminEmails.has(email) ? 'ADMIN' : 'USER'
          token.isBlocked = false
          token.createdAt = new Date().toISOString()
        }
      }

      return token
    },
    async signIn({ user }) {
      if (!user.email && !user.id) return false

      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(user.id ? [{ id: user.id }] : []),
            ...(user.email ? [{ email: user.email }] : []),
          ],
        },
        select: { isBlocked: true },
      })

      if (dbUser?.isBlocked) {
        return '/auth/error?error=AccessDenied'
      }

      return true
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}
