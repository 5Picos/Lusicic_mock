'use client'

import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import { expenses, suppliers, trucks, orders } from '@/lib/mock-data'
import type { Expense } from '@/lib/types'
import { DollarSign, Receipt } from 'lucide-react'

export default function InformesPagejesPage() {
  const tollExpenses = useMemo(() =>
    expenses.filter(e => {
      const supplier = suppliers.find(s => s.id === e.supplierId)
      return supplier?.expenseTypeId === 'et2'
    }),
    []
  )

  const total = useMemo(() => tollExpenses.reduce((s, e) => s + e.amount, 0), [tollExpenses])

  const columns: Column<Expense>[] = [
    { key: 'date',     header: 'Fecha',       cell: e => <span className="tabular-nums text-slate-500">{e.date}</span> },
    { key: 'supplier', header: 'Proveedor',   cell: e => <span className="font-medium text-slate-800">{suppliers.find(s => s.id === e.supplierId)?.name ?? '—'}</span> },
    { key: 'concept',  header: 'Descripción', cell: e => <span className="text-slate-700">{e.concept}</span> },
    { key: 'truck',    header: 'Camión',      cell: e => <span className="text-slate-500">{trucks.find(t => t.id === e.truckId)?.plate ?? '—'}</span> },
    { key: 'order',    header: 'Pedido',      cell: e => <span className="text-slate-500">{orders.find(o => o.id === e.orderId)?.orderNumber ?? '—'}</span> },
    { key: 'amount',   header: 'Monto',       className: 'text-right', cell: e => <span className="tabular-nums font-medium text-slate-700">${e.amount.toLocaleString('es-AR')}</span> },
  ]

  return (
    <div>
      <PageHeader title="Informe de peajes" subtitle="Gastos clasificados como Estatal / Impuestos." />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard variant="info" icon={DollarSign} label="Total peajes" value={`$${total.toLocaleString('es-AR')}`} />
        <SummaryCard variant="info" icon={Receipt} label="Cantidad" value={tollExpenses.length} />
      </div>
      <DataTable
        columns={columns}
        rows={tollExpenses}
        getRowId={e => e.id}
        emptyMessage="Sin gastos de peajes registrados"
      />
    </div>
  )
}
