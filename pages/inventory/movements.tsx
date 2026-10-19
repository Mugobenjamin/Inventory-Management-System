import { useEffect, useState } from 'react'

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/inventory/movements')
      const j = await res.json(); setMovements(j.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Inventory Movements</h1>
      <div className="grid gap-2">
        {movements.map(m => (
          <div key={m.id} className="bg-white p-3 rounded shadow">{m.type} | Variant: {m.productVariantId} | Qty: {m.quantity} | Ref: {m.referenceType} {m.referenceId}</div>
        ))}
      </div>
    </div>
  )
}
