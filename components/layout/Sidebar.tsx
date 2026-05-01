'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Wrench, History, CalendarClock,
  Truck, Users, Building2, Store, Settings, Package,
  MapPin, DollarSign, UserCog, ShoppingCart, FileCheck,
  Receipt, CreditCard, Banknote, FileText, PiggyBank,
  TrendingDown, TrendingUp, ArrowLeftRight, Route,
  Landmark, FileSearch, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    id: 'maestros',
    label: 'Maestros',
    items: [
      { href: '/camiones',    label: 'Camiones',       icon: Truck },
      { href: '/choferes',    label: 'Choferes',       icon: Users },
      { href: '/clientes',    label: 'Clientes',       icon: Building2 },
      { href: '/proveedores', label: 'Proveedores',    icon: Store },
      { href: '/tipos-gasto', label: 'Tipos de gasto', icon: Settings },
      { href: '/articulos',   label: 'Artículos',      icon: Package },
      { href: '/localidades', label: 'Localidades',    icon: MapPin },
      { href: '/precios',     label: 'Precios',        icon: DollarSign },
      { href: '/usuarios',    label: 'Usuarios',       icon: UserCog },
    ],
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    items: [
      { href: '/dashboard',           label: 'Dashboard',      icon: LayoutDashboard },
      { href: '/mantenimientos',      label: 'Tipos mant.',    icon: Wrench },
      { href: '/historial',           label: 'Historial',      icon: History },
      { href: '/vencimientos-chofer', label: 'Venc. choferes', icon: CalendarClock },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      { href: '/pedidos',          label: 'Pedidos',          icon: ShoppingCart },
      { href: '/remitos',          label: 'Remitos',          icon: FileCheck },
      { href: '/facturacion',      label: 'Facturación',      icon: Receipt },
      { href: '/cuenta-corriente', label: 'Cuenta corriente', icon: CreditCard },
      { href: '/cobros',           label: 'Cobros',           icon: Banknote },
      { href: '/cheques',          label: 'Cheques',          icon: FileText },
      { href: '/gastos',           label: 'Gastos',           icon: PiggyBank },
    ],
  },
  {
    id: 'informes',
    label: 'Informes',
    items: [
      { href: '/informes/gastos',           label: 'Gastos',         icon: TrendingDown },
      { href: '/informes/ingresos',         label: 'Ingresos',       icon: TrendingUp },
      { href: '/informes/comparativo',      label: 'Comparativo',    icon: ArrowLeftRight },
      { href: '/informes/viajes',           label: 'Viajes',         icon: Route },
      { href: '/informes/peajes',           label: 'Peajes',         icon: Landmark },
      { href: '/informes/facturas-destino', label: 'Fact. destino',  icon: FileSearch },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const activeGroupId = NAV_GROUPS.find(g =>
    g.items.some(item => pathname.startsWith(item.href))
  )?.id ?? 'mantenimiento'

  const [openGroupId, setOpenGroupId] = useState(activeGroupId)

  useEffect(() => {
    setOpenGroupId(activeGroupId)
  }, [activeGroupId])

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="text-[15px] font-bold text-slate-800 tracking-tight">FlotaTrack</div>
        <div className="text-[11px] text-slate-400 mt-0.5">Gestión de flota</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map(group => {
          const isOpen = group.id === openGroupId
          return (
            <div key={group.id}>
              <button
                onClick={() => setOpenGroupId(prev => prev === group.id ? '' : group.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-[7px] text-[11px] font-semibold',
                  isOpen ? 'text-slate-800 bg-slate-50' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                {group.label}
                <ChevronRight
                  size={12}
                  className={cn('transition-transform', isOpen && 'rotate-90')}
                />
              </button>
              {isOpen && (
                <div>
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-1.5 pl-6 pr-4 py-[6px] text-[12px]',
                          active
                            ? 'bg-blue-50 border-r-2 border-blue-600 text-slate-800 font-medium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                        )}
                      >
                        <Icon size={14} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
        <div className="w-[26px] h-[26px] rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600">
          GA
        </div>
        <div>
          <div className="text-[11px] font-medium text-slate-800">Admin</div>
          <div className="text-[10px] text-slate-400">Operador</div>
        </div>
      </div>
    </aside>
  )
}
