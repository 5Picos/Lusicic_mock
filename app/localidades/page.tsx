'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { localities as initialLocalities, localityTolls as initialTolls, suppliers } from '@/lib/mock-data'
import type { Locality, LocalityToll } from '@/lib/types'
import { Plus, Minus } from 'lucide-react'

type TollRow = {
  id?: string
  supplierId: string
  description: string
  amount: string
}

export default function LocalidadesPage() {
  const [localities, setLocalities] = useState(initialLocalities)
  const [tolls, setTolls] = useState(initialTolls)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Locality | null>(null)
  const [form, setForm] = useState({ name: '', roundTripKm: '' })
  const [tollDraft, setTollDraft] = useState<TollRow[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    localities.filter(l => l.name.toLowerCase().includes(search.toLowerCase())),
    [localities, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', roundTripKm: '' })
    setTollDraft([])
    setSheetOpen(true)
  }

  function openEdit(loc: Locality) {
    setEditingItem(loc)
    setForm({ name: loc.name, roundTripKm: String(loc.roundTripKm) })
    setTollDraft(
      tolls
        .filter(t => t.localityId === loc.id)
        .map(t => ({ id: t.id, supplierId: t.supplierId, description: t.description, amount: String(t.amount) }))
    )
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.roundTripKm) return
    let savedId: string
    const localityData = { name: form.name.trim(), roundTripKm: Number(form.roundTripKm) }

    if (editingItem) {
      savedId = editingItem.id
      setLocalities(prev => prev.map(l => l.id === savedId ? { ...editingItem, ...localityData } : l))
    } else {
      savedId = `lo${Date.now()}`
      setLocalities(prev => [...prev, { id: savedId, ...localityData }])
    }

    const newTolls: LocalityToll[] = tollDraft
      .filter(t => t.supplierId && t.description && t.amount)
      .map((t, idx) => ({
        id: t.id ?? `lt${Date.now()}-${idx}`,
        localityId: savedId,
        supplierId: t.supplierId,
        description: t.description,
        amount: Number(t.amount),
      }))
    setTolls(prev => [...prev.filter(t => t.localityId !== savedId), ...newTolls])
    setSheetOpen(false)
  }

  function handleDelete() {
    setLocalities(prev => prev.filter(l => l.id !== deleteId))
    setTolls(prev => prev.filter(t => t.localityId !== deleteId))
    setDeleteId(null)
  }

  function updateTollRow(idx: number, patch: Partial<TollRow>) {
    setTollDraft(prev => prev.map((t, i) => i === idx ? { ...t, ...patch } : t))
  }

  const deletingItem = localities.find(l => l.id === deleteId)

  const columns: Column<Locality>[] = [
    { key: 'name',        header: 'Localidad',     cell: l => <span className="font-medium text-slate-800">{l.name}</span> },
    { key: 'roundTripKm', header: 'Km ida/vuelta', className: 'text-right', cell: l => <span className="tabular-nums text-slate-600">{l.roundTripKm.toLocaleString('es-AR')}</span> },
    {
      key: 'tolls', header: 'Peajes',
      cell: l => {
        const count = tolls.filter(t => t.localityId === l.id).length
        return <span className="text-slate-500">{count > 0 ? `${count} peaje${count !== 1 ? 's' : ''}` : '—'}</span>
      },
    },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: l => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => openEdit(l)} className="text-[11px] text-blue-600 font-medium hover:underline">Editar</button>
          <button onClick={() => setDeleteId(l.id)} className="text-[11px] text-red-500 font-medium hover:underline">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Localidades"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nueva localidad</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={l => l.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar localidad..."
        emptyMessage="Sin localidades"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar localidad' : 'Nueva localidad'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Rosario" autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Km ida y vuelta</Label>
                <Input type="number" value={form.roundTripKm} onChange={e => setForm(p => ({ ...p, roundTripKm: e.target.value }))} placeholder="660" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Peajes</div>
              {tollDraft.length > 0 && (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-1.5 text-[10px] font-semibold text-slate-400 uppercase">Proveedor</th>
                      <th className="text-left pb-1.5 text-[10px] font-semibold text-slate-400 uppercase pl-2">Descripción</th>
                      <th className="text-right pb-1.5 text-[10px] font-semibold text-slate-400 uppercase pl-2">Monto</th>
                      <th className="w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tollDraft.map((t, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 pr-2">
                          <Select value={t.supplierId} onValueChange={v => updateTollRow(idx, { supplierId: v ?? '' })}>
                            <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Proveedor..." /></SelectTrigger>
                            <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="py-1.5 px-2">
                          <Input value={t.description} onChange={e => updateTollRow(idx, { description: e.target.value })} className="h-7 text-[11px]" placeholder="Cabina km 37" />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input type="number" value={t.amount} onChange={e => updateTollRow(idx, { amount: e.target.value })} className="h-7 text-[11px] text-right w-24 ml-auto" placeholder="8200" />
                        </td>
                        <td className="py-1.5 pl-1.5">
                          <button onClick={() => setTollDraft(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400">
                            <Minus size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                onClick={() => setTollDraft(prev => [...prev, { supplierId: '', description: '', amount: '' }])}
                className="flex items-center gap-1 text-[12px] text-blue-600 font-medium w-fit"
              >
                <Plus size={13} /> Agregar peaje
              </button>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.roundTripKm}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={deletingItem?.name}
      />
    </div>
  )
}
