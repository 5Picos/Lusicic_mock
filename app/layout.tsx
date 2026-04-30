import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlotaTrack',
  description: 'Sistema de gestión de flota',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
