import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const locations = await prisma.location.findMany({ orderBy: { id: 'asc' } })
    return res.status(200).json({ data: locations })
  } catch (e) {
    console.error('locations api error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
