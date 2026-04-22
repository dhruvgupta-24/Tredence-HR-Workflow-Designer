import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { StartNodeData } from '../../types'
import { useWorkflowStore } from '../../store'

type StartNodeType = Node<StartNodeData>

const StartIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
)

export const StartNode = memo(function StartNode({ id, data, selected }: NodeProps<StartNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const isCompleted   = useWorkflowStore((s) => s.completedNodeIds?.includes(id) ?? false)

  return (
    <div
      className={clsx(
        'w-[240px] rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
        'bg-th-bg-2 shadow-node',
        isHighlighted && 'node-highlighted border-green-400/60 ring-2 ring-green-400/25 shadow-lg shadow-green-500/15',
        isCompleted && !isHighlighted && 'node-completed border-green-500/40',
        !isHighlighted && !isCompleted && selected  && 'border-green-500/50 ring-2 ring-green-500/20 shadow-md shadow-green-500/10',
        !isHighlighted && !isCompleted && !selected && 'border-th-border hover:border-green-500/35 hover:shadow-node-hover hover:-translate-y-px',
      )}
    >
      {/* Coloured accent strip */}
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 opacity-80" />

      <div className="px-4 pt-3 pb-4">
        {/* Type header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-500/15 flex items-center justify-center flex-shrink-0 text-green-500">
              <StartIcon />
            </div>
            <span className="text-[10px] font-bold text-green-500/90 uppercase tracking-widest">Start</span>
          </div>
          {data.metadata.length > 0 && (
            <span className="text-[10px] text-th-text-3 font-mono tabular-nums bg-th-bg-3 px-1.5 py-0.5 rounded-md">
              {data.metadata.length}m
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[13.5px] font-semibold text-th-text-1 leading-snug truncate">
          {data.title || 'Untitled Start'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />
    </div>
  )
})
