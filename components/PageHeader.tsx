import { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
