import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { variantCreateSchema } from '@/lib/validation/product'
import { requireAnyRole } from '@/lib/api-helpers'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { productId } = req.query as any
      const where: any = {}
      if (productId) where.productId = Number(productId)
      const variants = await prisma.productVariant.findMany({ where })
      return res.json({ data: variants })
    }

    if (req.method === 'POST') {
      return requireAnyRole(['OWNER','ADMIN','INVENTORY_MANAGER'], async (req2, res2) => {
        const parsed = variantCreateSchema.safeParse(req2.body)
        if (!parsed.success) return res2.status(400).json({ error: parsed.error.flatten() })
        const { productId, sku, barcode, unit, attributes, cost, price } = parsed.data
        try {
          const variant = await prisma.productVariant.create({
            data: {
              productId,
              sku,
              barcode,
              unit,
              attributes: attributes ? attributes as any : undefined,
              cost: new prisma.$queryRaw`select ${cost}::numeric` as any,
              price: new prisma.$queryRaw`select ${price}::numeric` as any,
            }
          })
          return res2.status(201).json(variant)
        } catch (e: any) {
          // handle unique constraint on sku
          if (e?.code === 'P2002' && e.meta?.target?.includes('sku')) {
            return res2.status(409).json({ error: 'SKU already exists' })
          }
          console.error('create variant error', e)
          return res2.status(500).json({ error: 'Internal server error' })
        }
      })(req, res)
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('variants API error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
