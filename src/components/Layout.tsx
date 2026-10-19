import React from 'react'
import NavBar from './NavBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="max-w-7xl w-full mx-auto p-4 flex-1">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">Inventory Management System</footer>
    </div>
  )
}
