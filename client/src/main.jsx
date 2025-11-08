import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Register from './pages/Register'
import Login from './pages/Login'
import Templates from './pages/Templates'
import Favorites from './pages/Favorites'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import './index.css'

function Protected({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/templates" replace />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="templates" element={<Templates />} />
            <Route path="favorites" element={<Protected><Favorites /></Protected>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
