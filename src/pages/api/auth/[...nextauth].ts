import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { verifyPassword } from '@/lib/hash'

export default NextAuth({
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.hashedPassword) return null
        const ok = await verifyPassword(credentials.password, user.hashedPassword)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.userId = user.id
      return token
    },
    async session({ session, token }: any) {
      if (token?.userId) session.user = { id: token.userId, email: session.user?.email, name: session.user?.name }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})
