'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type AuthUser = { name: string; email: string }

type AuthContextType = {
  user: AuthUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('flotatrack_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(email: string, password: string): boolean {
    if (!email || !password) return false
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const userData: AuthUser = { name, email }
    setUser(userData)
    localStorage.setItem('flotatrack_user', JSON.stringify(userData))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('flotatrack_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
