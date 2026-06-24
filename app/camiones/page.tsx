'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trucks as initialItems, drivers } from '@/lib/mock-data'
import type { Truck } from '@/lib/types'
import { Plus, Satellite, RefreshCw, Loader2 } from 'lucide-react'

type TruckForm = {
  plate: string
  description: string
  brand: string
  model: string
  year: string
  realKm: string
  estimatedKm: string
  geotabDeviceId: string
}

const EMPTY_FORM: TruckForm = { plate: '', description: '', brand: '', model: '', year: '', realKm: '', estimatedKm: '', geotabDeviceId: '' }

function formatSyncAge(syncedAt: string | null): string {
  if (!syncedAt) return ''
  const diffH = Math.floor((Date.now() - new Date(syncedAt).getTime()) / 3_600_000)
  if (diffH < 1) return 'hace menos de 1h'
  if (diffH < 24) return `hace ${diffH}h`
  return `hace ${Math.floor(diffH / 24)}d`
}

export default function CamionesPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Truck | null>(null)
  const [form, setForm] = useState<TruckForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncingAll, setSyncingAll] = useState(false)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.plate.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.brand.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  function openEdit(item: Truck) {
    setEditingItem(item)
    setForm({
      plate: item.plate,
      description: item.description,
      brand: item.brand,
      model: item.model,
      year: String(item.year),
      realKm: String(item.realKm),
      estimatedKm: String(item.estimatedKm),
      geotabDeviceId: item.geotabDeviceId ?? '',
    })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return
    const parsed = {
      plate: form.plate.trim().toUpperCase(),
      description: form.description,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      realKm: Number(form.realKm) || 0,
      estimatedKm: Number(form.estimatedKm) || 0,
      geotabDeviceId: form.geotabDeviceId.trim() || null,
    }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...parsed } : i))
    } else {
      setItems(prev => [...prev, { id: `tr${Date.now()}`, geotabKm: null, geotabKmSyncedAt: null, ...parsed }])
    }
    setSheetOpen(false)
  }

  async function handleSync(truckId: string) {
    setSyncingId(truckId)
    await new Promise(r => setTimeout(r, 1200))
    setItems(prev => prev.map(t => {
      if (t.id !== truckId || !t.geotabDeviceId) return t
      const base = t.geotabKm ?? t.realKm
      return { ...t, geotabKm: base + Math.floor(50 + Math.random() * 150), geotabKmSyncedAt: new Date().toISOString() }
    }))
    setSyncingId(null)
  }

  async function handleSyncAll() {
    setSyncingAll(true)
    await new Promise(r => setTimeout(r, 2000))
    setItems(prev => prev.map(t => {
      if (!t.geotabDeviceId) return t
      const base = t.geotabKm ?? t.realKm
      return { ...t, geotabKm: base + Math.floor(50 + Math.random() * 150), geotabKmSyncedAt: new Date().toISOString() }
    }))
    setSyncingAll(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<Truck>[] = [
    { key: 'plate',       header: 'Patente',      cell: i => <span className="font-mono font-semibold text-slate-800">{i.plate}</span> },
    { key: 'description', header: 'Descripción',  cell: i => <span className="text-slate-600">{i.description || '—'}</span> },
    { key: 'brand',       header: 'Marca/Modelo', cell: i => <span className="text-slate-500">{i.brand} {i.model} ({i.year})</span> },
    {
      key: 'km',
      header: 'Km actuales',
      className: 'text-right',
      cell: i => {
        const km = i.geotabKm ?? i.realKm
        return (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className="tabular-nums text-slate-700">{km.toLocaleString('es-AR')}</span>
              {i.geotabKm !== null && <Satellite size={11} className="text-blue-400" />}
            </div>
            {i.geotabDeviceId && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSync(i.id)}
                  disabled={syncingId === i.id}
                  className="text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                >
                  {syncingId === i.id
                    ? <Loader2 size={10} className="animate-spin" />
                    : <RefreshCw size={10} />
                  }
                </button>
                <span className="text-[10px] text-slate-400">{formatSyncAge(i.geotabKmSyncedAt)}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'defaultDriver', header: 'Chofer por defecto',
      cell: i => {
        const driver = drivers.find(d => d.defaultTruckId === i.id)
        return driver
          ? <span className="text-slate-600">{driver.name}</span>
          : <span className="text-slate-400">—</span>
      },
    },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: i => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => openEdit(i)} className="row-action">Editar</button>
          <button onClick={() => setDeleteId(i.id)} className="row-action-danger">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Camiones"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSyncAll} disabled={syncingAll || !!syncingId}>
              {syncingAll
                ? <Loader2 size={14} className="mr-1.5 animate-spin" />
                : <RefreshCw size={14} className="mr-1.5" />}
              Actualizar desde RDA
            </Button>
            <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo camión</Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por patente, marca o descripción..."
        emptyMessage="Sin camiones"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar camión' : 'Nuevo camión'}</SheetTitle></SheetHeader>
          <div className="sheet-body">
            <div className="form-grid">
              <div className="form-field">
                <Label className="form-label">Patente</Label>
                <Input value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value }))} placeholder="ABC 123" autoFocus />
              </div>
              <div className="form-field">
                <Label className="form-label">Año</Label>
                <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2020" />
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label">Descripción</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Unidad 1" />
            </div>
            <div className="form-grid">
              <div className="form-field">
                <Label className="form-label">Marca</Label>
                <Input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Mercedes" />
              </div>
              <div className="form-field">
                <Label className="form-label">Modelo</Label>
                <Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Actros" />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <Label className="form-label">Km reales</Label>
                <Input type="number" value={form.realKm} onChange={e => setForm(p => ({ ...p, realKm: e.target.value }))} placeholder="87420" />
              </div>
              <div className="form-field">
                <Label className="form-label">Km estimados</Label>
                <Input type="number" value={form.estimatedKm} onChange={e => setForm(p => ({ ...p, estimatedKm: e.target.value }))} placeholder="88100" />
              </div>
            </div>
            <div className="sheet-section">
              <div className="flex items-center gap-1.5 mb-2">
                <Satellite size={12} className="text-blue-400" />
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Integración RDA</p>
              </div>
              <div className="form-field">
                <Label className="form-label">ID dispositivo RDA</Label>
                <Input
                  value={form.geotabDeviceId}
                  onChange={e => setForm(p => ({ ...p, geotabDeviceId: e.target.value }))}
                  placeholder="b1  (dejar vacío si no aplica)"
                  className="font-mono text-[12px]"
                />
              </div>
              {editingItem?.geotabKm !== null && editingItem?.geotabKm !== undefined && (
                <p className="text-[11px] text-slate-400 mt-2">
                  Km RDA actual: <span className="tabular-nums font-medium text-slate-600">{editingItem.geotabKm.toLocaleString('es-AR')}</span>
                  <span className="ml-1">— {formatSyncAge(editingItem.geotabKmSyncedAt)}</span>
                </p>
              )}
            </div>
          </div>
          <SheetFooter className="sheet-section">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.plate.trim() || !form.brand.trim() || !form.model.trim()}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={`${deletingItem?.plate} · ${deletingItem?.brand} ${deletingItem?.model}`}
      />
    </div>
  )
}
