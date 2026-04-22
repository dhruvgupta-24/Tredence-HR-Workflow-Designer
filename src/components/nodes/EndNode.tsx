import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { EndNodeData } from '../../types'
import { useWorkflowStore } from '../../store'

type EndNodeType = Node<EndNodeData>

const EndIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none"/>
  </svg>
)

export const EndNode = memo(function EndNode({ id, data, selected }: NodeProps<EndNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const isCompleted   = useWorkflowStore((s) => s.completedNodeIds?.includes(id) ?? false)
  const preview = data.endMessage?.length > 40
    ? data.endMessage.slice(0, 40) + '…'
    : data.endMessage

  return (
    <div
      className={clsx(
        'w-[240px] rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
        'bg-th-bg-2 shadow-node',
        isHighlighted && 'node-highlighted border-rose-400/60 ring-2 ring-rose-400/25 shadow-lg shadow-rose-500/15',
        isCompleted && !isHighlighted && 'node-completed border-green-500/40',
        !isHighlighted && !isCompleted && selected  && 'border-rose-500/50 ring-2 ring-rose-500/20 shadow-md shadow-rose-500/10',
        !isHighlighted && !isCompleted && !selected && 'border-th-border hover:border-rose-500/35 hover:shadow-node-hover hover:-translate-y-px',
      )}
    >
      {/* Red-rose accent strip */}
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 opacity-80" />

      <Handle type="target" position={Position.Top}
        className="!bg-rose-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />

      <div className="px-4 pt-3 pb-4">
        {/* Type header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-rose-500/15 flex items-center justify-center flex-shrink-0 text-rose-400">
            <EndIcon />
          </div>
          <span className="text-[10px] font-bold text-rose-400/90 uppercase tracking-widest">End</span>
        </div>

        {/* Title */}
        <p className="text-[13.5px] font-semibold text-th-text-1 leading-snug truncate mb-1.5">
          {data.title || 'Workflow End'}
        </p>

        {/* End message */}
        {preview && (
          <p className="text-[11px] text-th-text-3 leading-relaxed line-clamp-2">{preview}</p>
        )}
      </div>
    </div>
  )
})
