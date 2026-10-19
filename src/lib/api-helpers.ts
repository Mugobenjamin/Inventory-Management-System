import { NextApiHandler } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'

export function requireRole(roleName: string, handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.userId) return res.status(401).json({ error: 'Unauthorized' })
    const userId = token.userId as string
    const has = await prisma.userRole.findFirst({ where: { userId, role: { name: roleName } }, include: { role: true } })
    if (!has) return res.status(403).json({ error: 'Forbidden' })
    return handler(req, res)
  }
}
