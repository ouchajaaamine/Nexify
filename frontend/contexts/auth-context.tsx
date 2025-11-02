"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, getUser, setToken as saveToken, setUser as saveUser, removeToken, login as authLogin } from '@/lib/auth'

interface AuthContextType {
  user: any | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = getToken()
    const storedUser = getUser()
    
    if (storedToken) {
      setToken(storedToken)
      setUser(storedUser)
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authLogin(email, password)
    setToken(data.token)
    saveToken(data.token)
    
    const userData = { email }
    setUser(userData)
    saveUser(userData)
    
    router.push('/dashboard')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    removeToken()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
