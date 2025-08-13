import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth.config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Disable static generation for this route
export const dynamic = 'force-dynamic'