import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

function persistSession(data) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persistSession(data)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort : on déconnecte localement même si l'appel échoue
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
