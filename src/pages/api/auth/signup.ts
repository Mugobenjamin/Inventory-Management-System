import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/hash'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, name, password, role } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'User already exists' })

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword: hashed
    }
  })

  if (role) {
    const r = await prisma.role.findUnique({ where: { name: role } })
    if (r) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: r.id } })
    }
  }

  res.status(201).json({ id: user.id, email: user.email, name: user.name })
}
