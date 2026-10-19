import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', pageSize = '25', productVariantId } = req.query as any
    const pageNum = Math.max(1, Number(page))
    const size = Math.min(200, Number(pageSize))
    const where: any = {}
    if (productVariantId) where.productVariantId = Number(productVariantId)
    const [items, total] = await Promise.all([
      prisma.inventoryMovement.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * size, take: size }),
      prisma.inventoryMovement.count({ where })
    ])
    return res.json({ data: items, total })
  } catch (e) {
    console.error('inventory movements list error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
