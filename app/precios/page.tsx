'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { priceLists as initialPriceLists, localityPrices as initialLocalityPrices, localities, clients } from '@/lib/mock-data'
import type { PriceList } from '@/lib/types'
import { Plus, Trash2, Star } from 'lucide-react'

export default function PreciosPage() {
  const [priceLists, setPriceLists] = useState(initialPriceLists)
  const [localityPrices, setLocalityPrices] = useState(initialLocalityPrices)
  const [newListOpen, setNewListOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListClientId, setNewListClientId] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')
  const [deleteListId, setDeleteListId] = useState<string | null>(null)

  const generalLists = priceLists.filter(pl => pl.clientId === null)
  const clientLists = priceLists.filter(pl => pl.clientId !== null)

  function getPrice(priceListId: string, localityId: string): number | '' {
    return localityPrices.find(lp => lp.priceListId === priceListId && lp.localityId === localityId)?.price ?? ''
  }

  function handlePriceChange(priceListId: string, localityId: string, value: string) {
    const num = value === '' ? null : Number(value)
    setLocalityPrices(prev => {
      const existing = prev.find(lp => lp.priceListId === priceListId && lp.localityId === localityId)
      if (existing) {
        if (num === null) return prev.filter(lp => !(lp.priceListId === priceListId && lp.localityId === localityId))
        return prev.map(lp => lp.priceListId === priceListId && lp.localityId === localityId ? { ...lp, price: num } : lp)
      }
      if (num === null) return prev
      return [...prev, { id: `lp${Date.now()}`, priceListId, localityId, price: num }]
    })
  }

  function handleAddList() {
    if (!newListName.trim()) return
    setPriceLists(prev => [...prev, { id: `pl${Date.now()}`, name: newListName.trim(), clientId: newListClientId || null, isDefault: false }])
    setNewListName('')
    setNewListClientId('')
    setNewListOpen(false)
  }

  function handleEditListName() {
    if (!editingListId || !editingListName.trim()) return
    setPriceLists(prev => prev.map(pl => pl.id === editingListId ? { ...pl, name: editingListName.trim() } : pl))
    setEditingListId(null)
  }

  function handleSetDefault(id: string) {
    setPriceLists(prev => prev.map(pl => pl.clientId === null ? { ...pl, isDefault: pl.id === id } : pl))
  }

  function handleDeleteList() {
    if (!deleteListId) return
    setPriceLists(prev => {
      const deleting = prev.find(pl => pl.id === deleteListId)
      const remaining = prev.filter(pl => pl.id !== deleteListId)
      if (deleting?.isDefault) {
        const fallback = remaining.find(pl => pl.clientId === null)
        if (fallback) return remaining.map(pl => pl.id === fallback.id ? { ...pl, isDefault: true } : pl)
      }
      return remaining
    })
    setLocalityPrices(prev => prev.filter(lp => lp.priceListId !== deleteListId))
    setDeleteListId(null)
  }

  const deletingList = priceLists.find(pl => pl.id === deleteListId)

  function renderTable(lists: PriceList[]) {
    return (
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3.5 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em] w-[160px]">
              Localidad
            </th>
            {lists.map(pl => (
              <th key={pl.id} className="px-3.5 py-2.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">
                {pl.clientId ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] text-blue-500 font-medium normal-case tracking-normal">
                      {clients.find(c => c.id === pl.clientId)?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingListId(pl.id); setEditingListName(pl.name) }}
                        className="hover:text-slate-800 transition-colors"
                      >
                        {pl.name}
                      </button>
                      <button onClick={() => setDeleteListId(pl.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleSetDefault(pl.id)}
                      title={pl.isDefault ? 'Lista predeterminada' : 'Marcar como predeterminada'}
                      className="flex-shrink-0"
                    >
                      <Star size={11} className={pl.isDefault ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-400 transition-colors'} />
                    </button>
                    <button
                      onClick={() => { setEditingListId(pl.id); setEditingListName(pl.name) }}
                      className="hover:text-slate-800 transition-colors"
                    >
                      {pl.name}
                    </button>
                    <button onClick={() => setDeleteListId(pl.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localities.map(loc => (
            <tr key={loc.id} className="border-b border-slate-100 last:border-0">
              <td className="px-3.5 py-2 font-medium text-slate-700">{loc.name}</td>
              {lists.map(pl => (
                <td key={pl.id} className="px-2 py-1.5 text-right">
                  <Input
                    type="number"
                    value={getPrice(pl.id, loc.id)}
                    onChange={e => handlePriceChange(pl.id, loc.id, e.target.value)}
                    className="h-7 text-[12px] text-right tabular-nums w-28 ml-auto"
                    placeholder="—"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div>
      <PageHeader
        title="Precios"
        subtitle="Precio por localidad y lista. Celdas vacías = sin precio configurado."
        action={<Button size="sm" onClick={() => { setNewListName(''); setNewListClientId(''); setNewListOpen(true) }}><Plus size={14} className="mr-1" /> Nueva lista</Button>}
      />

      <div className="flex flex-col gap-5">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Listas generales
          </div>
          {renderTable(generalLists)}
        </div>

        {clientLists.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Listas por cliente
            </div>
            {renderTable(clientLists)}
          </div>
        )}
      </div>

      <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nueva lista de precios</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="form-field">
              <Label className="form-label">Nombre</Label>
              <Input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="CIP - 32 toneladas"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddList()}
              />
            </div>
            <div className="form-field">
              <Label className="form-label">Cliente (opcional)</Label>
              <Select value={newListClientId || 'general'} onValueChange={v => setNewListClientId(v === 'general' ? '' : (v ?? ''))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (sin cliente)</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewListOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddList} disabled={!newListName.trim()}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingListId} onOpenChange={open => !open && setEditingListId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Editar lista de precios</DialogTitle></DialogHeader>
          <div className="form-field py-2">
            <Label className="form-label">Nombre</Label>
            <Input
              value={editingListName}
              onChange={e => setEditingListName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleEditListName()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListId(null)}>Cancelar</Button>
            <Button onClick={handleEditListName} disabled={!editingListName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteListId}
        onOpenChange={open => !open && setDeleteListId(null)}
        onConfirm={handleDeleteList}
        itemName={deletingList?.name}
      />
    </div>
  )
}
