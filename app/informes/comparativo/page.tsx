'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import { Input } from '@/components/ui/input'
import { invoices, expenses, expenseTypes, suppliers } from '@/lib/mock-data'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'

type ComparativoRow = {
  id: string
  category: string
  amount: number
  isIncome: boolean
}

export default function InformesComparativoPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filteredInvoices = useMemo(() => invoices.filter(inv => {
    if (from && inv.date < from) return false
    if (to && inv.date > to) return false
    return true
  }), [from, to])

  const filteredExpenses = useMemo(() => expenses.filter(e => {
    if (from && e.date < from) return false
    if (to && e.date > to) return false
    return true
  }), [from, to])

  const ingresos = useMemo(
    () => filteredInvoices.reduce((s, inv) => s + inv.total, 0),
    [filteredInvoices]
  )
  const gastos = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  )
  const resultado = ingresos - gastos

  const rows = useMemo((): ComparativoRow[] => {
    const byType = expenseTypes.map(et => ({
      id: et.id,
      category: et.name,
      amount: filteredExpenses
        .filter(e => suppliers.find(s => s.id === e.supplierId)?.expenseTypeId === et.id)
        .reduce((s, e) => s + e.amount, 0),
      isIncome: false,
    })).filter(r => r.amount > 0)
    return [
      { id: 'ingresos', category: 'Ingresos facturados', amount: ingresos, isIncome: true },
      ...byType,
    ]
  }, [filteredExpenses, ingresos])

  return (
    <div>
      <PageHeader title="Comparativo ingresos / gastos" />
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Desde</span>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Hasta</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryCard variant="info" icon={TrendingUp} label="Ingresos" value={`$${ingresos.toLocaleString('es-AR')}`} iconBg="bg-green-50" />
        <SummaryCard variant="info" icon={TrendingDown} label="Gastos" value={`$${gastos.toLocaleString('es-AR')}`} iconBg="bg-red-50" />
        <SummaryCard variant="info" icon={BarChart2} label="Resultado" value={`$${resultado.toLocaleString('es-AR')}`} iconBg={resultado >= 0 ? 'bg-green-50' : 'bg-red-50'} />
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-[12px]">Sin datos para el período seleccionado</div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Categoría</th>
                <th className="px-3.5 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Monto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className={`border-b border-slate-100 last:border-0 ${row.isIncome ? 'bg-green-50/50' : ''}`}>
                  <td className="px-3.5 py-[9px] font-medium text-slate-700">{row.category}</td>
                  <td className={`px-3.5 py-[9px] text-right tabular-nums font-semibold ${row.isIncome ? 'text-green-700' : 'text-slate-700'}`}>
                    ${row.amount.toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-3.5 py-[9px] font-semibold text-slate-800">Resultado neto</td>
                <td className={`px-3.5 py-[9px] text-right tabular-nums font-bold ${resultado >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  ${resultado.toLocaleString('es-AR')}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
