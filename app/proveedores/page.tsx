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
import { suppliers as initialItems, expenseTypes } from '@/lib/mock-data'
import type { Supplier } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function ProveedoresPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Supplier | null>(null)
  const [form, setForm] = useState({ name: '', expenseTypeId: '', cuit: '', phone: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.cuit.includes(search)
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', expenseTypeId: '', cuit: '', phone: '' })
    setSheetOpen(true)
  }

  function openEdit(item: Supplier) {
    setEditingItem(item)
    setForm({ name: item.name, expenseTypeId: item.expenseTypeId, cuit: item.cuit, phone: item.phone })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.expenseTypeId) return
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...form, name: form.name.trim() } : i))
    } else {
      setItems(prev => [...prev, { id: `su${Date.now()}`, ...form, name: form.name.trim() }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<Supplier>[] = [
    { key: 'name',        header: 'Nombre',        cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'expenseType', header: 'Tipo de gasto', cell: i => <span className="text-slate-500">{expenseTypes.find(e => e.id === i.expenseTypeId)?.name ?? '—'}</span> },
    { key: 'cuit',        header: 'CUIT',          cell: i => <span className="font-mono text-[11px] text-slate-600">{i.cuit || '—'}</span> },
    { key: 'phone',       header: 'Teléfono',      cell: i => <span className="text-slate-500">{i.phone || '—'}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: i => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => openEdit(i)} className="text-[11px] text-blue-600 font-medium hover:underline">Editar</button>
          <button onClick={() => setDeleteId(i.id)} className="text-[11px] text-red-500 font-medium hover:underline">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Proveedores"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo proveedor</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o CUIT..."
        emptyMessage="Sin proveedores"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar proveedor' : 'Nuevo proveedor'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="YPF" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Tipo de gasto</Label>
              <Select value={form.expenseTypeId} onValueChange={v => setForm(p => ({ ...p, expenseTypeId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                <SelectContent>
                  {expenseTypes.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">CUIT</Label>
              <Input value={form.cuit} onChange={e => setForm(p => ({ ...p, cuit: e.target.value }))} placeholder="30-54668997-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Teléfono</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0800333" />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.expenseTypeId}>Guardar</Button>
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
