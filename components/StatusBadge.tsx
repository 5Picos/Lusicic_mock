import { cn } from '@/lib/utils'
import type { AlertState, OrderStatus, InvoiceStatus, VehicleIssueStatus } from '@/lib/types'

const ALERT_STYLES: Record<AlertState, string> = {
  overdue:    'bg-red-100 text-red-600',
  upcoming:   'bg-amber-100 text-amber-700',
  ok:         'bg-green-100 text-green-700',
  no_history: 'bg-slate-100 text-slate-500',
}
const ALERT_LABELS: Record<AlertState, string> = {
  overdue:    'VENCIDO',
  upcoming:   'PRÓXIMO',
  ok:         'AL DÍA',
  no_history: 'SIN HISTORIAL',
}

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-slate-100 text-slate-600',
  assigned:  'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced:  'bg-violet-100 text-violet-700',
}
const ORDER_LABELS: Record<OrderStatus, string> = {
  pending:   'PENDIENTE',
  assigned:  'ASIGNADO',
  delivered: 'ENTREGADO',
  invoiced:  'FACTURADO',
}

const INVOICE_STYLES: Record<InvoiceStatus, string> = {
  pending:        'bg-red-100 text-red-600',
  partially_paid: 'bg-amber-100 text-amber-700',
  paid:           'bg-green-100 text-green-700',
}
const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  pending:        'PENDIENTE COBRO',
  partially_paid: 'PAGO PARCIAL',
  paid:           'PAGADO',
}

const ISSUE_STYLES: Record<VehicleIssueStatus, string> = {
  pendiente:   'bg-red-100 text-red-600',
  atendido:    'bg-amber-100 text-amber-700',
  solucionado: 'bg-green-100 text-green-700',
  descartado:  'bg-slate-100 text-slate-500',
}
const ISSUE_LABELS: Record<VehicleIssueStatus, string> = {
  pendiente:   'PENDIENTE',
  atendido:    'ATENDIDO',
  solucionado: 'SOLUCIONADO',
  descartado:  'DESCARTADO',
}

type Props =
  | { variant: 'alert';     state: AlertState }
  | { variant: 'lifecycle'; state: OrderStatus }
  | { variant: 'payment';   state: InvoiceStatus }
  | { variant: 'issue';     state: VehicleIssueStatus }

export default function StatusBadge(props: Props) {
  let className: string
  let label: string

  if (props.variant === 'alert') {
    className = ALERT_STYLES[props.state]
    label = ALERT_LABELS[props.state]
  } else if (props.variant === 'lifecycle') {
    className = ORDER_STYLES[props.state]
    label = ORDER_LABELS[props.state]
  } else if (props.variant === 'payment') {
    className = INVOICE_STYLES[props.state]
    label = INVOICE_LABELS[props.state]
  } else {
    className = ISSUE_STYLES[props.state]
    label = ISSUE_LABELS[props.state]
  }

  return (
    <span className={cn('badge', className)}>
      {label}
    </span>
  )
}
