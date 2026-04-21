interface DraggableNodeProps {
  type: string
  label: string
  icon: string
  color: string
}

const colorBorderMap: Record<string, string> = {
  green: 'border-green-500/40 hover:border-green-400 bg-green-500/5 hover:bg-green-500/10',
  blue: 'border-blue-500/40 hover:border-blue-400 bg-blue-500/5 hover:bg-blue-500/10',
  orange: 'border-orange-500/40 hover:border-orange-400 bg-orange-500/5 hover:bg-orange-500/10',
  purple: 'border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10',
  red: 'border-red-500/40 hover:border-red-400 bg-red-500/5 hover:bg-red-500/10',
}

const colorIconMap: Record<string, string> = {
  green: 'text-green-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
}

export function DraggableNode({ type, label, icon, color }: DraggableNodeProps) {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={[
        'flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-grab active:cursor-grabbing',
        'transition-all duration-150 select-none',
        'hover:shadow-md hover:-translate-y-px',
        colorBorderMap[color] ?? colorBorderMap['blue'],
      ].join(' ')}
    >
      <span className={['text-base', colorIconMap[color] ?? 'text-gray-400'].join(' ')}>
        {icon}
      </span>
      <span className="text-sm text-gray-200 font-medium">{label}</span>
    </div>
  )
}
