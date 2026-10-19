import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return res.status(200).json({ user: null })
  return res.status(200).json({ user: { id: token.userId ?? null, email: token.email ?? null, name: token.name ?? null } })
}
