import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
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

  // keep a ref so the axios interceptor always reads the latest token
  const tokenRef = useRef(token)
  useEffect(()=>{ tokenRef.current = token }, [token])

  // create axios instance once and attach a single interceptor that reads tokenRef
  const authAxiosRef = useRef(null)
  if (!authAxiosRef.current) authAxiosRef.current = axios.create({ baseURL: API_BASE })
  useEffect(() => {
    const inst = authAxiosRef.current
    const id = inst.interceptors.request.use(cfg => {
      const tk = tokenRef.current
      if (tk) cfg.headers = { ...cfg.headers, Authorization: `Token ${tk}` }
      return cfg
    })
    return () => inst.interceptors.request.eject(id)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, authAxios: authAxiosRef.current }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
