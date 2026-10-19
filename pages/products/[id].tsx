import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import VariantForm from '@/components/VariantForm'

type Variant = {
  id: number
  sku: string
  price: string
  cost: string
}

type Product = {
  id: number
  name: string
  description?: string
  variants?: Variant[]
}

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [showVariant, setShowVariant] = useState(false)

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const json = await res.json()
        setProduct(json)
      } else {
        console.error('Product not found')
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div>Loading...</div>
  if (!product) return <div>Product not found</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div>
          <button onClick={() => setShowVariant(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Add variant</button>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{product.description}</p>

      {showVariant && <VariantForm productId={product.id} onCreated={() => { setShowVariant(false); load() }} onCancel={() => setShowVariant(false)} />}

      <div className="mt-4">
        <h2 className="text-lg font-medium">Variants</h2>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {product.variants?.map(v => (
            <div key={v.id} className="bg-white p-3 rounded shadow">
              <div className="font-medium">{v.sku}</div>
              <div className="text-sm text-gray-600">Price: {v.price} | Cost: {v.cost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
