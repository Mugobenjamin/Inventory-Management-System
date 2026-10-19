import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { variantUpdateSchema } from '@/lib/validation/product'
import { requireAnyRole } from '@/lib/api-helpers'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })
  try {
    if (req.method === 'GET') {
      const variant = await prisma.productVariant.findUnique({ where: { id: Number(id) } })
      if (!variant) return res.status(404).json({ error: 'Not found' })
      return res.json(variant)
    }

    if (req.method === 'PUT') {
      return requireAnyRole(['OWNER','ADMIN','INVENTORY_MANAGER'], async (req2, res2) => {
        const parsed = variantUpdateSchema.safeParse(req2.body)
        if (!parsed.success) return res2.status(400).json({ error: parsed.error.flatten() })
        const data = parsed.data as any
        // convert cost/price strings to Decimal using Prisma-compatible numeric strings
        if (data.cost) data.cost = data.cost
        if (data.price) data.price = data.price
        try {
          const updated = await prisma.productVariant.update({ where: { id: Number(id) }, data })
          return res2.json(updated)
        } catch (e: any) {
          if (e?.code === 'P2002' && e.meta?.target?.includes('sku')) {
            return res2.status(409).json({ error: 'SKU already exists' })
          }
          console.error('update variant error', e)
          return res2.status(500).json({ error: 'Internal server error' })
        }
      })(req, res)
    }

    if (req.method === 'DELETE') {
      // only admin/owner can delete variants
      return requireAnyRole(['OWNER','ADMIN'], async (req2, res2) => {
        await prisma.productVariant.delete({ where: { id: Number(id) } })
        return res2.json({ ok: true })
      })(req, res)
    }

    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('variant detail API error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
