import { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  getRowClassName?: (row: T) => string
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  action?: ReactNode
  title?: string
  emptyMessage?: string
}

export default function DataTable<T>({
  columns, rows, getRowId, getRowClassName,
  searchValue, onSearchChange, searchPlaceholder = 'Buscar...',
  filters, action, title, emptyMessage = 'Sin registros',
}: Props<T>) {
  const hasToolbar = onSearchChange || filters || action
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 text-[13px] font-semibold text-slate-800">
          {title}
        </div>
      )}
      {hasToolbar && (
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
          {onSearchChange && (
            <div className="relative max-w-[240px] flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-7 h-8 text-[12px]"
              />
            </div>
          )}
          {filters}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn('px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3.5 py-8 text-center text-slate-400 text-[12px]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr
                key={getRowId(row)}
                className={cn('border-b border-slate-100 last:border-0', getRowClassName?.(row))}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-3.5 py-[9px]', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
