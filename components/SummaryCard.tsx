import { cn } from '@/lib/utils'
import type { AlertState } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const ALERT_BORDER: Record<AlertState, string> = {
  overdue:    'border-t-red-600 border-red-200',
  upcoming:   'border-t-amber-500 border-amber-200',
  ok:         'border-t-green-600 border-green-200',
  no_history: 'border-t-slate-400 border-slate-200',
}
const ALERT_NUMBER: Record<AlertState, string> = {
  overdue:    'text-red-600',
  upcoming:   'text-amber-600',
  ok:         'text-green-600',
  no_history: 'text-slate-400',
}

type AlertProps = {
  variant: 'alert'
  state: AlertState
  value: number
  label: string
}

type InfoProps = {
  variant: 'info'
  icon: LucideIcon
  value: number | string
  label: string
  subtitle?: string
  iconBg?: string
}

type Props = AlertProps | InfoProps

export default function SummaryCard(props: Props) {
  if (props.variant === 'alert') {
    return (
      <div className={cn('bg-white rounded-lg border border-t-[3px] p-4', ALERT_BORDER[props.state])}>
        <div className={cn('text-[26px] font-bold leading-none tabular-nums', ALERT_NUMBER[props.state])}>
          {props.value}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 mt-1">
          {props.label}
        </div>
      </div>
    )
  }

  const Icon = props.icon
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500">
          {props.label}
        </div>
        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', props.iconBg ?? 'bg-blue-50')}>
          <Icon size={15} className="text-blue-600" />
        </div>
      </div>
      <div className="text-[26px] font-bold leading-none text-slate-800 tabular-nums">
        {props.value}
      </div>
      {props.subtitle && (
        <div className="text-[11px] text-slate-400">{props.subtitle}</div>
      )}
    </div>
  )
}
