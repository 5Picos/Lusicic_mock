'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@flotatrack.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(email, password)
    if (!ok) setError(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[360px] p-8">
        <div className="mb-7">
          <div className="text-[18px] font-bold text-slate-800 tracking-tight">FlotaTrack</div>
          <div className="text-[12px] text-slate-400 mt-0.5">Gestión de flota</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Correo electrónico</Label>
            <Input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(false) }}
              placeholder="usuario@empresa.com"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-[12px] text-red-500">Por favor ingresá tu correo y contraseña.</p>
          )}
          <Button type="submit" className="mt-1 w-full">Ingresar</Button>
        </form>

        <p className="mt-5 text-[11px] text-slate-400 text-center">
          Demo: <span className="font-medium">admin@flotatrack.com</span> / <span className="font-medium">admin123</span>
        </p>
      </div>
    </div>
  )
}
