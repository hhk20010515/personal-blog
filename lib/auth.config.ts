import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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