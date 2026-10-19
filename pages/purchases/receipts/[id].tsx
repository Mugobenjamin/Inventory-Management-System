import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ReceiptDetail() {
  const router = useRouter()
  const { id } = router.query
  const [receipt, setReceipt] = useState<any | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/goods-receipts/${id}`)
      if (res.ok) {
        const j = await res.json(); setReceipt(j)
        // fetch movements by referenceId
        const mres = await fetch(`/api/inventory/movements?referenceId=${id}`)
        if (mres.ok) { const mj = await mres.json(); setMovements(mj.data || []) }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (loading) return <div>Loading...</div>
  if (!receipt) return <div>Receipt not found</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Goods Receipt {receipt.id}</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div>External ID: {receipt.externalId ?? '—'}</div>
        <div>Received at: {new Date(receipt.createdAt).toLocaleString()}</div>
        <div>Received by: {receipt.receivedBy?.email ?? '—'}</div>
        <h2 className="mt-3 font-medium">Items</h2>
        <div className="mt-2 grid gap-2">
          {receipt.items.map((it: any) => (
            <div key={it.id} className="p-2 border rounded">Variant: {it.productVariantId} | Qty: {it.quantity} | Unit cost: {it.unitCost}</div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium">Inventory Movements</h2>
        <div className="mt-2 grid gap-2">
          {movements.map(m => (
            <div key={m.id} className="p-2 border rounded">{m.type} | Variant: {m.productVariantId} | Qty: {m.quantity} | Cost: {m.costPerUnit} | At: {new Date(m.createdAt).toLocaleString()}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
