import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productVariantId, locationId } = req.query as any
    const where: any = {}
    if (productVariantId) where.productVariantId = Number(productVariantId)
    if (locationId) where.locationId = Number(locationId)
    const items = await prisma.inventoryBalance.findMany({ where, include: { productVariant: true, location: true } })
    return res.json({ data: items })
  } catch (e) {
    console.error('inventory balances list error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
