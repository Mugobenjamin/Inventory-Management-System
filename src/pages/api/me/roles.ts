import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.userId) return res.status(200).json({ roles: [] })
  const userId = token.userId as string
  try {
    const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } })
    const roleNames = roles.map(r => r.role.name)
    return res.status(200).json({ roles: roleNames })
  } catch (e) {
    console.error('error fetching roles', e)
    return res.status(500).json({ roles: [] })
  }
}
