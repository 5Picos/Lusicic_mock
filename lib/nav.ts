import {
  LayoutDashboard, Wrench, History, CalendarClock, ClipboardList, Link2,
  Truck, Users, Building2, Store, Settings, Package,
  MapPin, DollarSign, UserCog, ShoppingCart, FileCheck,
  Receipt, CreditCard, Banknote, FileText, PiggyBank,
  TrendingDown, TrendingUp, ArrowLeftRight, Route,
  Landmark, FileSearch, AlertTriangle, Tags, type LucideIcon,
} from 'lucide-react'
import type { Section, UserRole } from './types'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export interface NavGroup {
  id: Section
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'maestros',
    label: 'Maestros',
    items: [
      { href: '/clientes',    label: 'Clientes',       icon: Building2 },
      { href: '/proveedores', label: 'Proveedores',    icon: Store },
      { href: '/tipos-gasto', label: 'Tipos de gasto', icon: Settings },
      { href: '/articulos',   label: 'Artículos',      icon: Package },
      { href: '/localidades', label: 'Localidades',    icon: MapPin },
      { href: '/precios',     label: 'Precios',        icon: DollarSign },
      { href: '/usuarios',    label: 'Usuarios',       icon: UserCog, adminOnly: true },
    ],
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    items: [
      { href: '/camiones',                    label: 'Camiones',       icon: Truck },
      { href: '/choferes',                    label: 'Choferes',       icon: Users },
      { href: '/dashboard',                   label: 'Dashboard',      icon: LayoutDashboard },
      { href: '/categorias-mantenimiento',    label: 'Categorías',     icon: Tags },
      { href: '/tipos-mantenimiento',         label: 'Tipos mant.',    icon: ClipboardList },
      { href: '/asignaciones-mantenimiento',  label: 'Asignaciones',   icon: Link2 },
      { href: '/mantenimientos',              label: 'Registros',      icon: Wrench },
      { href: '/fallas',                      label: 'Fallas',         icon: AlertTriangle },
      { href: '/historial',                   label: 'Historial',      icon: History },
      { href: '/vencimientos-chofer',         label: 'Venc. choferes', icon: CalendarClock },
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

interface PermissionUser {
  role: UserRole
  permissions: Section[]
}

/** Returns the nav groups/items visible to this user, with admin-only items stripped for non-admins. */
export function getAccessibleGroups(user: PermissionUser): NavGroup[] {
  if (user.role === 'admin') return NAV_GROUPS
  return NAV_GROUPS
    .filter(g => (user.permissions ?? []).includes(g.id))
    .map(g => ({ ...g, items: g.items.filter(item => !item.adminOnly) }))
}

/** First page this user is allowed to land on, used as the post-login / fallback redirect target. */
export function getFirstAccessibleHref(user: PermissionUser): string {
  const groups = getAccessibleGroups(user)
  return groups[0]?.items[0]?.href ?? '/login'
}

export function canAccessPath(user: PermissionUser, pathname: string): boolean {
  return getAccessibleGroups(user).some(g =>
    g.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  )
}
