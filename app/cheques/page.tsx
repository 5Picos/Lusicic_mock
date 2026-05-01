'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import { checks as initialChecks, invoicePayments, invoices, clients } from '@/lib/mock-data'
import type { Check, CheckStatus } from '@/lib/types'

const STATUS_STYLES: Record<CheckStatus, string> = {
  pending:  'bg-amber-100 text-amber-700',
  credited: 'bg-green-100 text-green-700',
}
const STATUS_LABELS: Record<CheckStatus, string> = {
  pending:  'PENDIENTE',
  credited: 'ACREDITADO',
}

export default function ChequesPage() {
  const [checks, setChecks] = useState(initialChecks)

  function markCredited(id: string) {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, status: 'credited' as CheckStatus } : c))
  }

  const columns: Column<Check>[] = [
    { key: 'bank',       header: 'Banco',        cell: c => <span className="font-medium text-slate-800">{c.bank}</span> },
    { key: 'number',     header: 'N° Cheque',    cell: c => <span className="font-mono text-[11px] text-slate-600">{c.checkNumber}</span> },
    { key: 'client',     header: 'Cliente',      cell: c => {
      const payment = invoicePayments.find(p => p.id === c.invoicePaymentId)
      const invoice = payment ? invoices.find(i => i.id === payment.invoiceId) : null
      return <span className="text-slate-500">{invoice ? (clients.find(cl => cl.id === invoice.clientId)?.name ?? '—') : '—'}</span>
    }},
    { key: 'creditDate', header: 'Fecha acred.', cell: c => <span className="tabular-nums text-slate-500">{c.creditDate}</span> },
    { key: 'amount',     header: 'Monto', className: 'text-right', cell: c => <span className="tabular-nums font-medium text-slate-700">${c.amount.toLocaleString('es-AR')}</span> },
    { key: 'status',     header: 'Estado',       cell: c => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[c.status]}`}>
        {STATUS_LABELS[c.status]}
      </span>
    )},
    {
      key: 'actions', header: '', className: 'text-right',
      cell: c => c.status === 'pending' ? (
        <button onClick={() => markCredited(c.id)} className="text-[11px] text-green-600 font-medium hover:underline">
          Marcar acreditado
        </button>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title="Cheques" subtitle="Cheques recibidos de clientes. Se registran desde Cobros." />
      <DataTable
        columns={columns}
        rows={checks}
        getRowId={c => c.id}
        emptyMessage="Sin cheques registrados"
      />
    </div>
  )
}
