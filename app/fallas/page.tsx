'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { vehicleIssueReports as initialReports, trucks, drivers } from '@/lib/mock-data'
import type { VehicleIssueReport } from '@/lib/types'
import { Plus } from 'lucide-react'

type ReportForm = {
  truckId: string
  driverId: string
  date: string
  description: string
}

const EMPTY_FORM: ReportForm = {
  truckId: '', driverId: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
}

export default function FallasPage() {
  const [reports, setReports] = useState(initialReports)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<ReportForm>(EMPTY_FORM)

  function handleSave() {
    if (!form.truckId || !form.driverId || !form.date || !form.description.trim()) return
    const newReport: VehicleIssueReport = {
      id: `vir${Date.now()}`,
      date: form.date,
      truckId: form.truckId,
      driverId: form.driverId,
      description: form.description.trim(),
      status: 'pendiente',
      source: 'manual',
    }
    setReports(prev => [newReport, ...prev])
    setSheetOpen(false)
    setForm(EMPTY_FORM)
  }

  function setStatus(id: string, status: VehicleIssueReport['status']) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const columns: Column<VehicleIssueReport>[] = [
    { key: 'date',        header: 'Fecha',       cell: r => <span className="tabular-nums text-slate-500">{r.date}</span> },
    { key: 'truck',       header: 'Camión',      cell: r => <span className="font-medium text-slate-800">{trucks.find(t => t.id === r.truckId)?.plate ?? '—'}</span> },
    { key: 'driver',      header: 'Chofer',      cell: r => <span className="text-slate-500">{drivers.find(d => d.id === r.driverId)?.name ?? '—'}</span> },
    { key: 'description', header: 'Descripción', cell: r => <span className="text-slate-700">{r.description}</span> },
    {
      key: 'source', header: 'Origen',
      cell: r => r.source === 'app'
        ? <span className="badge badge-blue">APP</span>
        : <span className="badge badge-slate">MANUAL</span>,
    },
    { key: 'status',      header: 'Estado',      cell: r => <StatusBadge variant="issue" state={r.status} /> },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: r => (
        <div className="flex items-center justify-end gap-3">
          {r.status === 'pendiente' && (
            <button onClick={() => setStatus(r.id, 'atendido')} className="row-action">Marcar atendido</button>
          )}
          {r.status === 'atendido' && (
            <>
              <button onClick={() => setStatus(r.id, 'solucionado')} className="text-[11px] text-green-600 font-medium hover:underline">Marcar solucionado</button>
              <button onClick={() => setStatus(r.id, 'descartado')} className="text-[11px] text-slate-400 font-medium hover:underline">Descartar</button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fallas reportadas"
        subtitle="Desperfectos o anomalías detectados por los choferes en sus vehículos."
        action={<Button size="sm" onClick={() => { setForm(EMPTY_FORM); setSheetOpen(true) }}><Plus size={14} className="mr-1" /> Nuevo reporte</Button>}
      />
      <DataTable
        columns={columns}
        rows={reports}
        getRowId={r => r.id}
        emptyMessage="Sin reportes de falla"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] flex flex-col">
          <SheetHeader><SheetTitle>Nuevo reporte de falla</SheetTitle></SheetHeader>
          <div className="sheet-body">
            <div className="form-field">
              <Label className="form-label">Camión</Label>
              <Select value={form.truckId} onValueChange={v => setForm(p => ({ ...p, truckId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar camión..." /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} — {t.brand} {t.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label className="form-label">Chofer</Label>
              <Select value={form.driverId} onValueChange={v => setForm(p => ({ ...p, driverId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar chofer..." /></SelectTrigger>
                <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label className="form-label">Fecha</Label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-field">
              <Label className="form-label">Descripción</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="¿Qué está fallando?" />
            </div>
          </div>
          <SheetFooter className="sheet-section">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.truckId || !form.driverId || !form.date || !form.description.trim()}
            >
              Registrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
