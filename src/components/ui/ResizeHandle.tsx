import clsx from 'clsx'

interface ResizeHandleProps {
  side: 'left' | 'right'
  isDragging: boolean
  tooltipWidth?: number | null
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick: () => void
  label: string
}

export function ResizeHandle({
  side,
  isDragging,
  tooltipWidth,
  onPointerDown,
  onDoubleClick,
  label,
}: ResizeHandleProps) {
  return (
    <div
      className={clsx(
        "absolute top-0 bottom-0 z-50 flex items-center justify-center cursor-col-resize transition-colors duration-150 group",
        "w-4 -ml-2 hover:bg-th-accent/10 sm:hidden md:flex",
        side === 'left' ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2",
        isDragging && "bg-th-accent/20"
      )}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {/* The visible line stroke */}
      <div 
        className={clsx(
          "w-0.5 h-full transition-colors duration-150",
          isDragging ? "bg-th-accent/80" : "bg-transparent group-hover:bg-th-accent/40"
        )} 
      />

      {/* Optional tooltip block when dragging */}
      {isDragging && tooltipWidth !== null && tooltipWidth !== undefined && (
        <div 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-th-bg-2 border border-th-border rounded shadow-lg text-[10px] font-mono whitespace-nowrap text-th-text-1 pointer-events-none",
            side === 'left' ? "left-6" : "right-6"
          )}
        >
          {label}: {tooltipWidth}px
        </div>
      )}
    </div>
  )
}
