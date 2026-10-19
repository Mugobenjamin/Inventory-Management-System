import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold">IMS</Link>
            <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">Products</Link>
            <Link href="/purchases" className="text-sm text-gray-600 hover:text-gray-900">Purchases</Link>
            <Link href="/sales" className="text-sm text-gray-600 hover:text-gray-900">Sales</Link>
          </div>
          <div>
            <Link href="/api/auth/signin" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
