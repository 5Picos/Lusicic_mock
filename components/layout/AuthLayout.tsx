'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { canAccessPath, getFirstAccessibleHref } from '@/lib/nav'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true) }, [])

  useEffect(() => {
    if (!ready) return
    if (!user && pathname !== '/login') { router.replace('/login'); return }
    if (user && pathname === '/login') { router.replace(getFirstAccessibleHref(user)); return }
    if (user && pathname !== '/login' && !canAccessPath(user, pathname)) {
      router.replace(getFirstAccessibleHref(user))
    }
  }, [ready, user, pathname, router])

  if (!ready) return <div className="h-screen bg-slate-50" />
  if (!user) return <>{children}</>

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  )
}
