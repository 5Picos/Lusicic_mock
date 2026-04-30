import { AlertTriangle } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title: string
  items: {
    id: string
    label: ReactNode
    action?: ReactNode
  }[]
}

export default function AmberPanel({ title, items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-amber-600" />
        <span className="text-[13px] font-semibold text-amber-900">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white border border-amber-200 rounded-md px-3 py-2 flex items-center justify-between"
          >
            <div className="text-[12px] text-slate-700">{item.label}</div>
            {item.action && <div className="text-[11px] text-blue-600 font-medium">{item.action}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
