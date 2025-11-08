import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try {
      await auth.login(username,password)
      nav('/templates')
    } catch(err){
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border px-3 py-2" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full border px-3 py-2" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
