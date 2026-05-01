'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import AmberPanel from '@/components/AmberPanel'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { invoices as initialInvoices, invoicePayments as initialPayments, checks as initialChecks, clients } from '@/lib/mock-data'
import type { Invoice, InvoicePayment, Check, InvoiceStatus, PaymentMethod } from '@/lib/types'
import { Plus } from 'lucide-react'

const PM_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  check: 'Cheque',
}

type CobroForm = {
  invoiceId: string
  amount: string
  paymentMethod: PaymentMethod
  reference: string
  notes: string
  checkBank: string
  checkNumber: string
  checkCreditDate: string
  checkAmount: string
}

const EMPTY_FORM: CobroForm = {
  invoiceId: '', amount: '', paymentMethod: 'cash', reference: '', notes: '',
  checkBank: '', checkNumber: '',
  checkCreditDate: new Date().toISOString().split('T')[0],
  checkAmount: '',
}

export default function CobrosPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [payments, setPayments] = useState<InvoicePayment[]>(initialPayments)
  const [checks, setChecks] = useState<Check[]>(initialChecks)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<CobroForm>(EMPTY_FORM)

  function getPaidAmount(invoiceId: string, currentPayments = payments) {
    return currentPayments.filter(p => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0)
  }

  function getPendingBalance(invoiceId: string) {
    const inv = invoices.find(i => i.id === invoiceId)
    return inv ? inv.total - getPaidAmount(invoiceId) : 0
  }

  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partially_paid')

  function openForInvoice(invoiceId: string) {
    setForm({ ...EMPTY_FORM, invoiceId, amount: String(getPendingBalance(invoiceId)) })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.invoiceId || !form.amount) return
    const paid = Number(form.amount)
    const newPayment: InvoicePayment = {
      id: `ip${Date.now()}`,
      invoiceId: form.invoiceId,
      date: new Date().toISOString().split('T')[0],
      amount: paid,
      paymentMethod: form.paymentMethod,
      reference: form.reference,
      notes: form.notes,
    }
    const updatedPayments = [...payments, newPayment]
    setPayments(updatedPayments)

    if (form.paymentMethod === 'check') {
      const newCheck: Check = {
        id: `ch${Date.now()}`,
        invoicePaymentId: newPayment.id,
        bank: form.checkBank,
        checkNumber: form.checkNumber,
        creditDate: form.checkCreditDate,
        amount: Number(form.checkAmount) || paid,
        status: 'pending',
      }
      setChecks(prev => [...prev, newCheck])
    }

    const totalPaid = getPaidAmount(form.invoiceId, updatedPayments)
    const inv = invoices.find(i => i.id === form.invoiceId)!
    const newStatus: InvoiceStatus = totalPaid >= inv.total ? 'paid' : 'partially_paid'
    setInvoices(prev => prev.map(i => i.id === form.invoiceId ? { ...i, status: newStatus } : i))
    setSheetOpen(false)
    setForm(EMPTY_FORM)
  }

  const columns: Column<InvoicePayment>[] = [
    { key: 'date',      header: 'Fecha',      cell: p => <span className="tabular-nums text-slate-500">{p.date}</span> },
    { key: 'invoice',   header: 'Factura',    cell: p => {
      const inv = invoices.find(i => i.id === p.invoiceId)
      return <span className="font-medium text-slate-800">{inv?.invoiceNumber ?? '—'}</span>
    }},
    { key: 'client',    header: 'Cliente',    cell: p => {
      const inv = invoices.find(i => i.id === p.invoiceId)
      return <span className="text-slate-700">{clients.find(c => c.id === inv?.clientId)?.name ?? '—'}</span>
    }},
    { key: 'amount',    header: 'Monto', className: 'text-right', cell: p => <span className="tabular-nums font-medium text-slate-700">${p.amount.toLocaleString('es-AR')}</span> },
    { key: 'method',    header: 'Forma pago', cell: p => <span className="text-[11px] text-slate-500">{PM_LABELS[p.paymentMethod]}</span> },
    { key: 'reference', header: 'Referencia', cell: p => <span className="text-[11px] text-slate-400">{p.reference || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Cobros"
        action={<Button size="sm" onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true) }}><Plus size={14} className="mr-1" /> Registrar cobro</Button>}
      />

      <AmberPanel
        title={`${pendingInvoices.length} factura${pendingInvoices.length !== 1 ? 's' : ''} pendiente${pendingInvoices.length !== 1 ? 's' : ''} de cobro`}
        items={pendingInvoices.map(inv => ({
          id: inv.id,
          label: (
            <span className="flex items-center gap-3">
              <span className="font-semibold">{inv.invoiceNumber}</span>
              <span className="text-slate-500">{clients.find(c => c.id === inv.clientId)?.name}</span>
              <StatusBadge variant="payment" state={inv.status} />
              <span className="tabular-nums text-[11px] text-slate-400">
                Saldo: ${getPendingBalance(inv.id).toLocaleString('es-AR')}
              </span>
            </span>
          ),
          action: <button onClick={() => openForInvoice(inv.id)} className="hover:underline">Registrar cobro →</button>,
        }))}
      />

      <DataTable
        title="Cobros registrados"
        columns={columns}
        rows={payments}
        getRowId={p => p.id}
        emptyMessage="Sin cobros registrados"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Registrar cobro</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 py-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Factura</Label>
              <Select value={form.invoiceId} onValueChange={v => {
                const id = v ?? ''
                setForm(p => ({ ...p, invoiceId: id, amount: String(getPendingBalance(id)) }))
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar factura..." /></SelectTrigger>
                <SelectContent>
                  {pendingInvoices.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} · {clients.find(c => c.id === inv.clientId)?.name} · Saldo ${getPendingBalance(inv.id).toLocaleString('es-AR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Monto cobrado</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
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
              <Label className="text-[10px] uppercase text-slate-500">Referencia</Label>
              <Input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="N° transferencia, etc." />
            </div>
            {form.paymentMethod === 'check' && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Datos del cheque</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase text-slate-500">Banco</Label>
                    <Input value={form.checkBank} onChange={e => setForm(p => ({ ...p, checkBank: e.target.value }))} placeholder="Banco Galicia" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase text-slate-500">N° Cheque</Label>
                    <Input value={form.checkNumber} onChange={e => setForm(p => ({ ...p, checkNumber: e.target.value }))} placeholder="001234" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase text-slate-500">Fecha acreditación</Label>
                    <Input type="date" value={form.checkCreditDate} onChange={e => setForm(p => ({ ...p, checkCreditDate: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase text-slate-500">Monto cheque</Label>
                    <Input type="number" value={form.checkAmount} onChange={e => setForm(p => ({ ...p, checkAmount: e.target.value }))} placeholder={form.amount} />
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.invoiceId || !form.amount}>Registrar cobro</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
