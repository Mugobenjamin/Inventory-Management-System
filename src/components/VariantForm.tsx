import { useState } from 'react'

export default function VariantForm({ productId, onCreated, onCancel }: { productId: number, onCreated?: () => void, onCancel?: () => void }) {
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [unit, setUnit] = useState('pc')
  const [cost, setCost] = useState('0.00')
  const [price, setPrice] = useState('0.00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/products/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sku, barcode, unit, cost, price })
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j?.error || 'Failed')
      } else {
        onCreated && onCreated()
      }
    } catch (e: any) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">SKU</label>
            <input value={sku} onChange={e => setSku(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Barcode</label>
            <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Unit</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Cost</label>
            <input value={cost} onChange={e => setCost(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex gap-2 mt-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">Create Variant</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
