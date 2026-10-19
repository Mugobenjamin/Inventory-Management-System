import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })
  try {
    const gr = await prisma.goodsReceipt.findUnique({ where: { id }, include: { items: true, receivedBy: true } })
    if (!gr) return res.status(404).json({ error: 'Not found' })
    return res.json(gr)
  } catch (e) {
    console.error('goods receipt detail error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
