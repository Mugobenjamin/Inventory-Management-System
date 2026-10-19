import { useState } from 'react'

export default function ProductForm({ onCreated, onCancel }: { onCreated?: () => void, onCancel?: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
