import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { requireAnyRole } from '@/lib/api-helpers'
import { Prisma } from '@prisma/client'

// POST: create goods receipt (transactional)
// GET: list receipts

async function createGoodsReceiptHandler(req: NextApiRequest, res: NextApiResponse) {
  return requireAnyRole(['OWNER','ADMIN','INVENTORY_MANAGER'], async (req2, res2) => {
    const body = req2.body
    const { purchaseOrderId, externalId, items, locationId } = body
    if (!items || !Array.isArray(items) || items.length === 0) return res2.status(400).json({ error: 'Items required' })
    // validate items
    for (const it of items) {
      if (!it.productVariantId || !it.quantity || Number(it.quantity) <= 0) return res2.status(400).json({ error: 'Each item needs productVariantId and positive quantity' })
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // idempotency: if externalId provided, ensure not exists
        if (externalId) {
          const exists = await tx.goodsReceipt.findUnique({ where: { externalId } })
          if (exists) throw { status: 409, message: 'GoodsReceipt with externalId already exists' }
        }

        const gr = await tx.goodsReceipt.create({
          data: {
            externalId: externalId ?? undefined,
            purchaseOrderId: purchaseOrderId ?? undefined,
            receivedById: (req2 as any).userId ?? undefined,
          }
        })

        for (const it of items) {
          // ensure variant exists
          const variant = await tx.productVariant.findUnique({ where: { id: Number(it.productVariantId) } })
          if (!variant) throw { status: 400, message: `Variant ${it.productVariantId} not found` }

          const qty = new Prisma.Decimal(it.quantity)
          const unitCost = new Prisma.Decimal(it.unitCost ?? variant.cost)

          await tx.goodsReceiptItem.create({
            data: {
              goodsReceiptId: gr.id,
              productVariantId: variant.id,
              quantity: qty,
              unitCost: unitCost,
            }
          })

          // create inventory movement
          await tx.inventoryMovement.create({
            data: {
              type: 'RECEIPT',
              productVariantId: variant.id,
              quantity: qty,
              costPerUnit: unitCost,
              locationId: locationId ?? undefined,
              referenceType: 'GOODS_RECEIPT',
              referenceId: gr.id,
              createdById: (req2 as any).userId ?? undefined,
            }
          })

          // update balance atomically
          // try to update existing balance first
          const updated = await tx.inventoryBalance.updateMany({
            where: { productVariantId: variant.id, locationId: locationId ?? null },
            data: { quantity: { increment: qty } }
          })
          if (updated.count === 0) {
            await tx.inventoryBalance.create({
              data: { productVariantId: variant.id, locationId: locationId ?? undefined, quantity: qty }
            })
          }
        }

        // audit log
        await tx.auditLog.create({ data: { action: 'CREATE_GOODS_RECEIPT', details: { goodsReceiptId: gr.id, itemCount: items.length }, actorId: (req2 as any).userId ?? undefined } })

        return gr
      })

      return res2.status(201).json(result)
    } catch (e: any) {
      if (e?.status) return res2.status(e.status).json({ error: e.message })
      console.error('create goods receipt error', e)
      return res2.status(500).json({ error: 'Internal server error' })
    }
  })(req, res)
}

async function listHandler(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', pageSize = '25' } = req.query as any
  const pageNum = Math.max(1, Number(page))
  const size = Math.min(200, Number(pageSize))
  try {
    const [items, total] = await Promise.all([
      prisma.goodsReceipt.findMany({ include: { items: true }, skip: (pageNum - 1) * size, take: size, orderBy: { createdAt: 'desc' } }),
      prisma.goodsReceipt.count()
    ])
    return res.json({ data: items, total })
  } catch (e) {
    console.error('list goods receipts error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return createGoodsReceiptHandler(req, res)
  if (req.method === 'GET') return listHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
