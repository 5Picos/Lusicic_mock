import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName?: string
}

export default function DeleteConfirmDialog({ open, onOpenChange, onConfirm, itemName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-slate-600 py-2">
          {itemName ? `¿Eliminar "${itemName}"?` : '¿Confirmar eliminación?'} Esta acción no se puede deshacer.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
