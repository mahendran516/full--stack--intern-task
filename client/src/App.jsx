import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

export default function App() {
  const { token, logout, user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Mini SaaS Template Store</h1>
          <nav className="space-x-4">
            <Link to="/templates" className="text-blue-600">Templates</Link>
            <Link to="/favorites" className="text-blue-600">My Favorites</Link>
            {!token ? <Link to="/login" className="ml-4 text-green-600">Login</Link>
              : <button onClick={logout} className="ml-4 text-red-600">Logout</button>}
               <Link to="/register" className="text-blue-600">Register</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
