'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expiryRecords as initialRecords, driverExpiryAssigned, driverExpiryTypes, drivers } from '@/lib/mock-data'
import type { ExpiryRecord } from '@/lib/types'
import { Plus } from 'lucide-react'

type ExpiryForm = {
  driverId: string
  expiryTypeId: string
  date: string
  notes: string
}

const EMPTY_FORM: ExpiryForm = {
  driverId: '', expiryTypeId: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function VencimientosChoferPage() {
  const [records, setRecords] = useState(initialRecords)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<ExpiryForm>(EMPTY_FORM)

  const availableTypes = useMemo(() => {
    if (!form.driverId) return []
    return driverExpiryAssigned
      .filter(a => a.driverId === form.driverId && a.active)
      .map(a => driverExpiryTypes.find(t => t.id === a.expiryTypeId))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
  }, [form.driverId])

  function handleSave() {
    if (!form.driverId || !form.expiryTypeId || !form.date) return
    const newRecord: ExpiryRecord = {
      id: `er${Date.now()}`,
      driverId: form.driverId,
      expiryTypeId: form.expiryTypeId,
      date: form.date,
      notes: form.notes,
    }
    setRecords(prev => [newRecord, ...prev])
    setSheetOpen(false)
    setForm(EMPTY_FORM)
  }

  const columns: Column<ExpiryRecord>[] = [
    { key: 'date',   header: 'Fecha',      cell: r => <span className="tabular-nums text-slate-500">{r.date}</span> },
    { key: 'driver', header: 'Chofer',     cell: r => <span className="font-medium text-slate-800">{drivers.find(d => d.id === r.driverId)?.name ?? '—'}</span> },
    { key: 'type',   header: 'Documento',  cell: r => <span className="text-slate-700">{driverExpiryTypes.find(t => t.id === r.expiryTypeId)?.name ?? '—'}</span> },
    { key: 'notes',  header: 'Notas',      cell: r => <span className="text-[11px] text-slate-400">{r.notes || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Vencimientos de choferes"
        action={<Button size="sm" onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true) }}><Plus size={14} className="mr-1" /> Registrar renovación</Button>}
      />
      <DataTable
        columns={columns}
        rows={records}
        getRowId={r => r.id}
        emptyMessage="Sin registros de vencimientos"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>Registrar renovación</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 py-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Chofer</Label>
              <Select value={form.driverId} onValueChange={v => setForm(p => ({ ...p, driverId: v ?? '', expiryTypeId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar chofer..." /></SelectTrigger>
                <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Tipo de documento</Label>
              <Select value={form.expiryTypeId} onValueChange={v => setForm(p => ({ ...p, expiryTypeId: v ?? '' }))}>
                <SelectTrigger disabled={!form.driverId}>
                  <SelectValue placeholder={form.driverId ? 'Seleccionar tipo...' : 'Primero seleccionar chofer'} />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Fecha de renovación</Label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.driverId || !form.expiryTypeId || !form.date}>Registrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
