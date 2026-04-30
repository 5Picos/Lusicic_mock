'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { priceLists as initialPriceLists, localityPrices as initialLocalityPrices, localities } from '@/lib/mock-data'
import { Plus, Trash2 } from 'lucide-react'

export default function PreciosPage() {
  const [priceLists, setPriceLists] = useState(initialPriceLists)
  const [localityPrices, setLocalityPrices] = useState(initialLocalityPrices)
  const [newListOpen, setNewListOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')
  const [deleteListId, setDeleteListId] = useState<string | null>(null)

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
    setPriceLists(prev => [...prev, { id: `pl${Date.now()}`, name: newListName.trim() }])
    setNewListName('')
    setNewListOpen(false)
  }

  function handleEditListName() {
    if (!editingListId || !editingListName.trim()) return
    setPriceLists(prev => prev.map(pl => pl.id === editingListId ? { ...pl, name: editingListName.trim() } : pl))
    setEditingListId(null)
  }

  function handleDeleteList() {
    if (!deleteListId) return
    setPriceLists(prev => prev.filter(pl => pl.id !== deleteListId))
    setLocalityPrices(prev => prev.filter(lp => lp.priceListId !== deleteListId))
    setDeleteListId(null)
  }

  const deletingList = priceLists.find(pl => pl.id === deleteListId)

  return (
    <div>
      <PageHeader
        title="Precios"
        subtitle="Precio por localidad y lista. Celdas vacías = sin precio configurado."
        action={<Button size="sm" onClick={() => { setNewListName(''); setNewListOpen(true) }}><Plus size={14} className="mr-1" /> Nueva lista</Button>}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3.5 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em] w-[160px]">
                Localidad
              </th>
              {priceLists.map(pl => (
                <th key={pl.id} className="px-3.5 py-2.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">
                  <div className="flex items-center justify-end gap-2">
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localities.map(loc => (
              <tr key={loc.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3.5 py-2 font-medium text-slate-700">{loc.name}</td>
                {priceLists.map(pl => (
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
      </div>

      <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nueva lista de precios</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
            <Input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="CIP - 32 toneladas"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddList()}
            />
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
          <div className="flex flex-col gap-1.5 py-2">
            <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
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
