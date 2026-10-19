import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { productUpdateSchema } from '@/lib/validation/product'
import { requireAnyRole } from '@/lib/api-helpers'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })
  try {
    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: { variants: true, category: true, brand: true }
      })
      if (!product) return res.status(404).json({ error: 'Not found' })
      return res.json(product)
    }

    if (req.method === 'PUT') {
      return requireAnyRole(['OWNER','ADMIN','INVENTORY_MANAGER'], async (req2, res2) => {
        const parsed = productUpdateSchema.safeParse(req.body)
        if (!parsed.success) return res2.status(400).json({ error: parsed.error.flatten() })
        const data = parsed.data
        const updated = await prisma.product.update({ where: { id: Number(id) }, data })
        return res2.json(updated)
      })(req, res)
    }

    if (req.method === 'DELETE') {
      // soft-delete archive
      return requireAnyRole(['OWNER','ADMIN'], async (req2, res2) => {
        const updated = await prisma.product.update({ where: { id: Number(id) }, data: { status: 'ARCHIVED' } })
        return res2.json({ ok: true, product: updated })
      })(req, res)
    }

    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('product detail API error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
