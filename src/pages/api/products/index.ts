import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { productCreateSchema } from '@/lib/validation/product'
import { requireAnyRole } from '@/lib/api-helpers'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { q, category, brand, page = '1', pageSize = '25' } = req.query as any
      const where: any = { status: 'ACTIVE' }
      if (q) {
        where.OR = [
          { name: { contains: q as string, mode: 'insensitive' } },
          { variants: { some: { sku: { contains: q as string, mode: 'insensitive' } } } }
        ]
      }
      if (category) where.categoryId = Number(category)
      if (brand) where.brandId = Number(brand)

      const pageNum = Math.max(1, parseInt(page))
      const size = Math.min(100, Math.max(1, parseInt(pageSize)))

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { variants: true, category: true, brand: true },
          skip: (pageNum - 1) * size,
          take: size,
          orderBy: { name: 'asc' }
        }),
        prisma.product.count({ where })
      ])

      return res.json({ data: items, total })
    }

    if (req.method === 'POST') {
      // only inventory manager or admin/owner can create products
      return requireAnyRole(['OWNER','ADMIN','INVENTORY_MANAGER'], async (req2, res2) => {
        const parsed = productCreateSchema.safeParse(req.body)
        if (!parsed.success) return res2.status(400).json({ error: parsed.error.flatten() })
        const { name, description, categoryId, brandId, status } = parsed.data
        const product = await prisma.product.create({
          data: { name, description, categoryId, brandId, status: status ?? 'ACTIVE' }
        })
        return res2.status(201).json(product)
      })(req, res)
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('products API error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
