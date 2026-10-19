import { useEffect, useState } from 'react'
import ProductForm from '@/components/ProductForm'

type Variant = {
  id: number
  sku: string
}

type Product = {
  id: number
  name: string
  description?: string
  variants?: Variant[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&page=${page}`)
      const json = await res.json()
      setProducts(json.data || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [q, page])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded">New product</button>
        </div>
      </div>

      <div className="mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU" className="w-full p-2 border rounded" />
      </div>

      {showCreate && <ProductForm onCreated={() => { setShowCreate(false); load() }} onCancel={() => setShowCreate(false)} />}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded shadow">
              <h2 className="font-medium text-lg">{p.name}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>
              <div className="mt-2 text-sm text-gray-700">Variants: {p.variants?.length ?? 0}</div>
              <div className="mt-4">
                <a className="text-blue-600" href={`/products/${p.id}`}>Open</a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <div />
        <div className="flex gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 bg-white border rounded">Prev</button>
          <div className="px-3 py-1 bg-white border rounded">{page}</div>
          <button onClick={() => setPage(page + 1)} className="px-3 py-1 bg-white border rounded">Next</button>
        </div>
      </div>
    </div>
  )
}
