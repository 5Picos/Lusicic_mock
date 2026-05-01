'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expenses as initialExpenses, suppliers, expenseTypes, trucks, orders } from '@/lib/mock-data'
import type { Expense, PaymentMethod } from '@/lib/types'
import { Plus } from 'lucide-react'

const PM_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  check: 'Cheque',
}

type ExpenseForm = {
  supplierId: string
  date: string
  concept: string
  truckId: string
  orderId: string
  amount: string
  paymentMethod: PaymentMethod
  reference: string
  notes: string
}

const EMPTY_FORM: ExpenseForm = {
  supplierId: '',
  date: new Date().toISOString().split('T')[0],
  concept: '', truckId: '', orderId: '', amount: '',
  paymentMethod: 'cash', reference: '', notes: '',
}

export default function GastosPage() {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM)

  const filtered = useMemo(() => expenses.filter(e => {
    const supplier = suppliers.find(s => s.id === e.supplierId)
    if (typeFilter && supplier?.expenseTypeId !== typeFilter) return false
    if (!search) return true
    const s = search.toLowerCase()
    return e.concept.toLowerCase().includes(s) || (supplier?.name.toLowerCase().includes(s) ?? false)
  }), [expenses, search, typeFilter])

  function handleSave() {
    if (!form.supplierId || !form.concept.trim() || !form.amount) return
    const newExpense: Expense = {
      id: `ex${Date.now()}`,
      supplierId: form.supplierId,
      date: form.date,
      concept: form.concept.trim(),
      truckId: form.truckId || null,
      orderId: form.orderId || null,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      reference: form.reference,
      notes: form.notes,
    }
    setExpenses(prev => [newExpense, ...prev])
    setSheetOpen(false)
  }

  const columns: Column<Expense>[] = [
    { key: 'date',     header: 'Fecha',      cell: e => <span className="tabular-nums text-slate-500">{e.date}</span> },
    { key: 'supplier', header: 'Proveedor',  cell: e => <span className="font-medium text-slate-800">{suppliers.find(s => s.id === e.supplierId)?.name ?? '—'}</span> },
    { key: 'concept',  header: 'Concepto',   cell: e => <span className="text-slate-700">{e.concept}</span> },
    { key: 'truck',    header: 'Camión',     cell: e => <span className="text-slate-500">{trucks.find(t => t.id === e.truckId)?.plate ?? '—'}</span> },
    { key: 'amount',   header: 'Monto',      className: 'text-right', cell: e => <span className="tabular-nums font-medium text-slate-700">${e.amount.toLocaleString('es-AR')}</span> },
    { key: 'method',   header: 'Forma pago', cell: e => <span className="text-[11px] text-slate-500">{PM_LABELS[e.paymentMethod]}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Gastos"
        action={<Button size="sm" onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true) }}><Plus size={14} className="mr-1" /> Registrar gasto</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={e => e.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por concepto o proveedor..."
        filters={
          <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : (v ?? ''))}>
            <SelectTrigger className="h-8 text-[12px] w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {expenseTypes.map(et => <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
        emptyMessage="Sin gastos registrados"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Registrar gasto</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 py-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Proveedor</Label>
                <Select value={form.supplierId} onValueChange={v => setForm(p => ({ ...p, supplierId: v ?? '' }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Concepto</Label>
              <Input value={form.concept} onChange={e => setForm(p => ({ ...p, concept: e.target.value }))} placeholder="Combustible viaje Rosario" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Camión (opcional)</Label>
                <Select value={form.truckId || 'none'} onValueChange={v => setForm(p => ({ ...p, truckId: v === 'none' ? '' : (v ?? '') }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin camión</SelectItem>
                    {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Pedido (opcional)</Label>
                <Select value={form.orderId || 'none'} onValueChange={v => setForm(p => ({ ...p, orderId: v === 'none' ? '' : (v ?? '') }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin pedido</SelectItem>
                    {orders.filter(o => o.status !== 'pending').map(o => <SelectItem key={o.id} value={o.id}>{o.orderNumber}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Monto</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="15000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Forma de pago</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(p => ({ ...p, paymentMethod: (v ?? 'cash') as PaymentMethod }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Referencia / N° comprobante</Label>
              <Input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="FAC-0001" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.supplierId || !form.concept.trim() || !form.amount}>Registrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
