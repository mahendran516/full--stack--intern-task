import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // token and user kept in memory only (no localStorage)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  const login = async (username, password) => {
    const res = await axios.post(`${API_BASE}/login`, { username, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (username, password) => {
    const res = await axios.post(`${API_BASE}/register`, { username, password })
    return res.data
  }

  const logout = () => {
    // optional: tell server to invalidate token
    if (token) axios.post(`${API_BASE}/logout`, {}, { headers: { Authorization: `Token ${token}` } }).catch(()=>{})
    setToken(null)
    setUser(null)
  }

  const authAxios = axios.create({ baseURL: API_BASE })
  // attach token header dynamically
  authAxios.interceptors.request.use(cfg => {
    if (token) cfg.headers = { ...cfg.headers, Authorization: `Token ${token}` }
    return cfg
  })

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
