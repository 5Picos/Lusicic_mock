'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { users } from './mock-data'
import type { UserRole, Section } from './types'

export type AuthUser = { id: string; name: string; email: string; role: UserRole; permissions: Section[] }

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
    const stored = localStorage.getItem('lusicic_user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return { ...parsed, permissions: parsed.permissions ?? [] }
  })

  function login(email: string, password: string): boolean {
    if (!email || !password) return false
    const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!match) return false
    const userData: AuthUser = { id: match.id, name: match.name, email: match.email, role: match.role, permissions: match.permissions }
    setUser(userData)
    localStorage.setItem('lusicic_user', JSON.stringify(userData))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('lusicic_user')
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
