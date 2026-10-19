import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRoles } from '@/lib/useRoles'

export default function NavBar() {
  const { data: session } = useSession()
  const { roles, loading } = useRoles()

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
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">{session.user.name ?? session.user.email}</div>
                {!loading && roles?.length > 0 && (
                  <div className="flex gap-1">
                    {roles.map((r: string) => (
                      <span key={r} className="px-2 py-0.5 bg-gray-100 text-xs rounded">{r}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => signOut()} className="text-sm text-red-600">Sign out</button>
              </div>
            ) : (
              <button onClick={() => signIn()} className="text-sm text-gray-600 hover:text-gray-900">Sign in</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
