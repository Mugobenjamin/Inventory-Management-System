import { useState } from 'react'
import { productCreateSchema } from '@/lib/validation/product'
import { z } from 'zod'
import { useRoles } from '@/lib/useRoles'

export default function ProductForm({ onCreated, onCancel }: { onCreated?: () => void, onCancel?: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const { roles, loading } = useRoles()
  const canCreate = roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('INVENTORY_MANAGER')

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    const parsed = productCreateSchema.safeParse({ name, description })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      const errs: Record<string,string> = {}
      for (const k in flat) {
        errs[k] = (flat as any)[k]?.[0]
      }
      setFieldErrors(errs)
      setSaving(false)
      return
    }

    if (!canCreate) {
      setError('You do not have permission to create products')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j?.error || 'Failed')
      } else {
        onCreated && onCreated()
        setName('')
        setDescription('')
      }
    } catch (e: any) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <form onSubmit={submit}>
        <div className="mb-2">
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
          {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name}</div>}
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
          {fieldErrors.description && <div className="text-red-600 text-sm">{fieldErrors.description}</div>}
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving || !canCreate} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Create</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
