import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  // Temporarily disable database adapter for initial deployment
  // adapter: PrismaAdapter(prisma),
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
    async session({ session, token }) {
      if (session.user) {
        // Use JWT token data instead of database
        session.user.id = token.sub || ''
        session.user.role = token.role || 'USER'
        session.user.isBlocked = false
        session.user.createdAt = new Date()
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.email === 'hhk20010515@gmail.com' ? 'ADMIN' : 'USER'
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Allow all sign ins for now - no database check
      return true
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}