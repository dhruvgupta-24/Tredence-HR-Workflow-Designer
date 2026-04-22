import type { ReactNode } from 'react'

interface DraggableNodeProps {
  type: string
  label: string
  icon: ReactNode
  color: string
  description?: string
}

const colorMap: Record<string, { border: string; bg: string; hoverBorder: string; hoverBg: string; iconBg: string; dot: string }> = {
  green:  { border: 'border-green-500/30',  bg: 'bg-green-500/5',  hoverBorder: 'hover:border-green-400/60',  hoverBg: 'hover:bg-green-500/10',  iconBg: 'bg-green-500/12  text-green-400',  dot: 'bg-green-400' },
  blue:   { border: 'border-blue-500/30',   bg: 'bg-blue-500/5',   hoverBorder: 'hover:border-blue-400/60',   hoverBg: 'hover:bg-blue-500/10',   iconBg: 'bg-blue-500/12   text-blue-400',   dot: 'bg-blue-400' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/5', hoverBorder: 'hover:border-orange-400/60', hoverBg: 'hover:bg-orange-500/10', iconBg: 'bg-orange-500/12 text-orange-400', dot: 'bg-orange-400' },
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', hoverBorder: 'hover:border-purple-400/60', hoverBg: 'hover:bg-purple-500/10', iconBg: 'bg-purple-500/12 text-purple-400', dot: 'bg-purple-400' },
  red:    { border: 'border-red-500/30',    bg: 'bg-red-500/5',    hoverBorder: 'hover:border-red-400/60',    hoverBg: 'hover:bg-red-500/10',    iconBg: 'bg-red-500/12    text-red-400',    dot: 'bg-red-400' },
}

export function DraggableNode({ type, label, icon, color, description }: DraggableNodeProps) {
  const c = colorMap[color] ?? colorMap['blue']!

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      data-demo-target={`node-${type}`}
      className={[
        'flex items-center gap-2.5 px-3 py-2.5 border rounded-xl',
        'cursor-grab active:cursor-grabbing active:scale-[0.98]',
        'transition-all duration-150 select-none',
        'hover:-translate-y-px hover:shadow-md',
        c.border, c.bg, c.hoverBorder, c.hoverBg,
      ].join(' ')}
    >
      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-th-text-1 leading-none">{label}</p>
        {description && <p className="text-[10px] text-th-text-3 mt-0.5 leading-none truncate">{description}</p>}
      </div>
      <div className={`w-1.5 h-1.5 rounded-full opacity-40 flex-shrink-0 ${c.dot}`} />
    </div>
  )
}
