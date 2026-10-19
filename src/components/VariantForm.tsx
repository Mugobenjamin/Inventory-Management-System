import { useState } from 'react'
import { variantCreateSchema } from '@/lib/validation/product'
import { useRoles } from '@/lib/useRoles'

export default function VariantForm({ productId, onCreated, onCancel }: { productId: number, onCreated?: () => void, onCancel?: () => void }) {
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [unit, setUnit] = useState('pc')
  const [cost, setCost] = useState('0.00')
  const [price, setPrice] = useState('0.00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const { roles } = useRoles()
  const canCreate = roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('INVENTORY_MANAGER')

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    const parsed = variantCreateSchema.safeParse({ productId, sku, barcode, unit, attributes: {}, cost, price })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      const errs: Record<string,string> = {}
      for (const k in flat) errs[k] = (flat as any)[k]?.[0]
      setFieldErrors(errs)
      setSaving(false)
      return
    }

    if (!canCreate) {
      setError('You do not have permission to create variants')
      setSaving(false)
      return
    }

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
        setSku('')
        setBarcode('')
        setCost('0.00')
        setPrice('0.00')
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
            {fieldErrors.sku && <div className="text-red-600 text-sm">{fieldErrors.sku}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Barcode</label>
            <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full p-2 border rounded" />
            {fieldErrors.barcode && <div className="text-red-600 text-sm">{fieldErrors.barcode}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Unit</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Cost</label>
            <input value={cost} onChange={e => setCost(e.target.value)} className="w-full p-2 border rounded" />
            {fieldErrors.cost && <div className="text-red-600 text-sm">{fieldErrors.cost}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded" />
            {fieldErrors.price && <div className="text-red-600 text-sm">{fieldErrors.price}</div>}
          </div>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex gap-2 mt-3">
          <button type="submit" disabled={saving || !canCreate} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Create Variant</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
