import { useEffect, useState } from 'react'

type VariantOption = { id: number, sku: string, productId: number }

type ReceiptItem = { productVariantId: number | null, quantity: string, unitCost: string }

export default function ReceivePage() {
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [items, setItems] = useState<ReceiptItem[]>([{ productVariantId: null, quantity: '0', unitCost: '0.00' }])
  const [externalId, setExternalId] = useState('')
  const [locationId, setLocationId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { loadVariants(); loadLocations() }, [])

  async function loadVariants() {
    try {
      const res = await fetch('/api/products/variants')
      const j = await res.json()
      setVariants((j.data || []).map((v: any) => ({ id: v.id, sku: v.sku, productId: v.productId })))
    } catch (e) { console.error(e) }
  }

  async function loadLocations() {
    try {
      const res = await fetch('/api/locations')
      const j = await res.json()
      setLocations(j.data || [])
      if ((j.data || []).length > 0) setLocationId((j.data[0] as any).id)
    } catch (e) { console.error(e) }
  }

  function addRow() {
    setItems([...items, { productVariantId: null, quantity: '0', unitCost: '0.00' }])
  }

  function removeRow(i: number) {
    const copy = items.slice(); copy.splice(i,1); setItems(copy)
  }

  function updateRow(i: number, data: Partial<ReceiptItem>) {
    const copy = items.slice(); copy[i] = { ...copy[i], ...data }; setItems(copy)
  }

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(null)
    // basic validation
    if (!locationId) { setError('Location required'); setSaving(false); return }
    const payloadItems = []
    for (const it of items) {
      if (!it.productVariantId) { setError('All rows must select a variant'); setSaving(false); return }
      const qty = Number(it.quantity)
      if (!(qty > 0)) { setError('Quantity must be > 0'); setSaving(false); return }
      payloadItems.push({ productVariantId: it.productVariantId, quantity: it.quantity, unitCost: it.unitCost })
    }
    try {
      const res = await fetch('/api/goods-receipts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ externalId: externalId || undefined, locationId, items: payloadItems }) })
      if (res.status === 201) {
        const j = await res.json(); setSuccess(`Goods receipt created: ${j.id}`); setItems([{ productVariantId: null, quantity: '0', unitCost: '0.00' }]); setExternalId('')
      } else {
        const j = await res.json(); setError(j?.error || 'Failed to create')
      }
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Receive Goods</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium">External ID (optional)</label>
            <input value={externalId} onChange={e => setExternalId(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Location</label>
            <select value={locationId ?? ''} onChange={e => setLocationId(Number(e.target.value))} className="w-full p-2 border rounded">
              <option value="">Select</option>
              {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="font-medium">Items</h2>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mt-2">
              <div>
                <label className="text-sm">Variant</label>
                <select value={it.productVariantId ?? ''} onChange={e => updateRow(idx, { productVariantId: e.target.value ? Number(e.target.value) : null })} className="w-full p-2 border rounded">
                  <option value="">Select variant</option>
                  {variants.map(v => (<option key={v.id} value={v.id}>{v.sku}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm">Quantity</label>
                <input value={it.quantity} onChange={e => updateRow(idx, { quantity: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-sm">Unit cost</label>
                <input value={it.unitCost} onChange={e => updateRow(idx, { unitCost: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => removeRow(idx)} className="px-3 py-2 bg-red-50 text-red-600 rounded">Remove</button>
              </div>
            </div>
          ))}
          <div className="mt-3">
            <button type="button" onClick={addRow} className="px-3 py-2 bg-gray-100 rounded">Add item</button>
          </div>
        </div>

        {error && <div className="text-red-600 mt-3">{error}</div>}
        {success && <div className="text-green-600 mt-3">{success}</div>}

        <div className="mt-4">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">Create Goods Receipt</button>
        </div>
      </form>
    </div>
  )
}
