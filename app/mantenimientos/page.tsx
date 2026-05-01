'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  maintenanceRecords as initialRecords, assignedMaintenances, maintenanceTypes,
  trucks as initialTrucks, drivers,
} from '@/lib/mock-data'
import type { MaintenanceRecord, Truck } from '@/lib/types'
import { Plus } from 'lucide-react'

type MaintForm = {
  truckId: string
  maintenanceTypeId: string
  date: string
  kmAtMoment: string
  driverId: string
  notes: string
}

const EMPTY_FORM: MaintForm = {
  truckId: '', maintenanceTypeId: '',
  date: new Date().toISOString().split('T')[0],
  kmAtMoment: '', driverId: '', notes: '',
}

export default function MantenimientosPage() {
  const [records, setRecords] = useState(initialRecords)
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<MaintForm>(EMPTY_FORM)

  const availableTypes = useMemo(() => {
    if (!form.truckId) return []
    return assignedMaintenances
      .filter(a => a.truckId === form.truckId && a.active)
      .map(a => maintenanceTypes.find(mt => mt.id === a.maintenanceTypeId))
      .filter((mt): mt is NonNullable<typeof mt> => Boolean(mt))
  }, [form.truckId])

  function handleSave() {
    if (!form.truckId || !form.maintenanceTypeId || !form.date || !form.kmAtMoment || !form.driverId) return
    const km = Number(form.kmAtMoment)
    const newRecord: MaintenanceRecord = {
      id: `mr${Date.now()}`,
      truckId: form.truckId,
      maintenanceTypeId: form.maintenanceTypeId,
      driverId: form.driverId,
      date: form.date,
      kmAtMoment: km,
      notes: form.notes,
    }
    setRecords(prev => [newRecord, ...prev])
    setTrucks(prev => prev.map(t => t.id === form.truckId && km > t.realKm ? { ...t, realKm: km } : t))
    setSheetOpen(false)
    setForm(EMPTY_FORM)
  }

  const columns: Column<MaintenanceRecord>[] = [
    { key: 'date',   header: 'Fecha',  cell: r => <span className="tabular-nums text-slate-500">{r.date}</span> },
    { key: 'truck',  header: 'Camión', cell: r => <span className="font-medium text-slate-800">{trucks.find(t => t.id === r.truckId)?.plate ?? '—'}</span> },
    { key: 'type',   header: 'Tipo',   cell: r => <span className="text-slate-700">{maintenanceTypes.find(mt => mt.id === r.maintenanceTypeId)?.name ?? '—'}</span> },
    { key: 'driver', header: 'Chofer', cell: r => <span className="text-slate-500">{drivers.find(d => d.id === r.driverId)?.name ?? '—'}</span> },
    { key: 'km',     header: 'Km', className: 'text-right', cell: r => <span className="tabular-nums text-slate-600">{r.kmAtMoment.toLocaleString('es-AR')}</span> },
    { key: 'notes',  header: 'Notas',  cell: r => <span className="text-[11px] text-slate-400">{r.notes || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Mantenimientos"
        action={<Button size="sm" onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true) }}><Plus size={14} className="mr-1" /> Registrar</Button>}
      />
      <DataTable
        columns={columns}
        rows={records}
        getRowId={r => r.id}
        emptyMessage="Sin registros de mantenimiento"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] flex flex-col">
          <SheetHeader><SheetTitle>Registrar mantenimiento</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Camión</Label>
              <Select value={form.truckId} onValueChange={v => setForm(p => ({ ...p, truckId: v ?? '', maintenanceTypeId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar camión..." /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} — {t.brand} {t.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Tipo de mantenimiento</Label>
              <Select value={form.maintenanceTypeId} onValueChange={v => setForm(p => ({ ...p, maintenanceTypeId: v ?? '' }))}>
                <SelectTrigger disabled={!form.truckId}>
                  <SelectValue placeholder={form.truckId ? 'Seleccionar tipo...' : 'Primero seleccionar camión'} />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(mt => <SelectItem key={mt.id} value={mt.id}>{mt.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Km al momento</Label>
                <Input type="number" value={form.kmAtMoment} onChange={e => setForm(p => ({ ...p, kmAtMoment: e.target.value }))} placeholder="88000" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Chofer</Label>
              <Select value={form.driverId} onValueChange={v => setForm(p => ({ ...p, driverId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar chofer..." /></SelectTrigger>
                <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.truckId || !form.maintenanceTypeId || !form.date || !form.kmAtMoment || !form.driverId}
            >
              Registrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
