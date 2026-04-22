import clsx from 'clsx'

interface ResizeHandleProps {
  side: 'left' | 'right'
  isDragging: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick: () => void
}

export function ResizeHandle({
  side,
  isDragging,
  onPointerDown,
  onDoubleClick,
}: ResizeHandleProps) {
  return (
    <div
      className={clsx(
        'absolute top-0 bottom-0 z-50 flex items-center justify-center cursor-col-resize transition-colors duration-150 group',
        'w-4 -ml-2 hover:bg-th-accent/10 sm:hidden md:flex',
        side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
        isDragging && 'bg-th-accent/20',
      )}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={clsx(
          'w-0.5 h-full transition-colors duration-150',
          isDragging ? 'bg-th-accent/80' : 'bg-transparent group-hover:bg-th-accent/40',
        )}
      />
    </div>
  )
}
