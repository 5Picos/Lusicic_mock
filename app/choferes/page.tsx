'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { drivers as initialItems } from '@/lib/mock-data'
import type { Driver } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function ChoferesPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Driver | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', phone: '', email: '' })
    setSheetOpen(true)
  }

  function openEdit(item: Driver) {
    setEditingItem(item)
    setForm({ name: item.name, phone: item.phone, email: item.email })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...form, name: form.name.trim() } : i))
    } else {
      setItems(prev => [...prev, { id: `dr${Date.now()}`, ...form, name: form.name.trim() }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<Driver>[] = [
    { key: 'name',  header: 'Nombre',   cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'phone', header: 'Teléfono', cell: i => <span className="text-slate-500">{i.phone || '—'}</span> },
    { key: 'email', header: 'Email',    cell: i => <span className="text-slate-500">{i.email || '—'}</span> },
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
        title="Choferes"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo chofer</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        emptyMessage="Sin choferes"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar chofer' : 'Nuevo chofer'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Carlos Méndez" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Teléfono</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="1145678901" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="chofer@mail.com" />
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Guardar</Button>
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
