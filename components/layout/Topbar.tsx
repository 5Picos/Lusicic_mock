'use client'

import { usePathname } from 'next/navigation'

const BREADCRUMBS: Record<string, { group: string; page: string }> = {
  '/dashboard':                  { group: 'Mantenimiento',  page: 'Dashboard' },
  '/mantenimientos':             { group: 'Mantenimiento',  page: 'Tipos de mantenimiento' },
  '/historial':                  { group: 'Mantenimiento',  page: 'Historial' },
  '/vencimientos-chofer':        { group: 'Mantenimiento',  page: 'Venc. choferes' },
  '/camiones':                   { group: 'Maestros',       page: 'Camiones' },
  '/choferes':                   { group: 'Maestros',       page: 'Choferes' },
  '/clientes':                   { group: 'Maestros',       page: 'Clientes' },
  '/proveedores':                { group: 'Maestros',       page: 'Proveedores' },
  '/tipos-gasto':                { group: 'Maestros',       page: 'Tipos de gasto' },
  '/articulos':                  { group: 'Maestros',       page: 'Artículos' },
  '/localidades':                { group: 'Maestros',       page: 'Localidades' },
  '/precios':                    { group: 'Maestros',       page: 'Precios' },
  '/usuarios':                   { group: 'Maestros',       page: 'Usuarios' },
  '/pedidos':                    { group: 'Administración', page: 'Pedidos' },
  '/remitos':                    { group: 'Administración', page: 'Remitos' },
  '/facturacion':                { group: 'Administración', page: 'Facturación' },
  '/cuenta-corriente':           { group: 'Administración', page: 'Cuenta corriente' },
  '/cobros':                     { group: 'Administración', page: 'Cobros' },
  '/cheques':                    { group: 'Administración', page: 'Cheques' },
  '/gastos':                     { group: 'Administración', page: 'Gastos' },
  '/informes/gastos':            { group: 'Informes',       page: 'Gastos' },
  '/informes/ingresos':          { group: 'Informes',       page: 'Ingresos' },
  '/informes/comparativo':       { group: 'Informes',       page: 'Comparativo' },
  '/informes/viajes':            { group: 'Informes',       page: 'Viajes' },
  '/informes/peajes':            { group: 'Informes',       page: 'Peajes' },
  '/informes/facturas-destino':  { group: 'Informes',       page: 'Facturas por destino' },
}

export default function Topbar() {
  const pathname = usePathname()
  const crumb = BREADCRUMBS[pathname] ?? { group: '', page: pathname }

  return (
    <header className="h-11 bg-white border-b border-slate-200 flex items-center px-5 flex-shrink-0">
      <nav className="flex items-center gap-1.5 text-[11px]">
        {crumb.group && (
          <>
            <span className="text-slate-500">{crumb.group}</span>
            <span className="text-slate-300">›</span>
          </>
        )}
        <span className="text-slate-800 font-medium">{crumb.page}</span>
      </nav>
    </header>
  )
}
