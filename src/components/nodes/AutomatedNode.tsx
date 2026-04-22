import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { AutomatedNodeData } from '../../types'
import { useWorkflowStore } from '../../store'

type AutomatedNodeType = Node<AutomatedNodeData>

const AutomatedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

// Prettify the raw action ID (e.g. "send_email" → "Send Email")
function formatAction(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export const AutomatedNode = memo(function AutomatedNode({ id, data, selected }: NodeProps<AutomatedNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const isCompleted   = useWorkflowStore((s) => s.completedNodeIds?.includes(id) ?? false)

  return (
    <div
      className={clsx(
        'w-[240px] rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
        'bg-th-bg-2 shadow-node',
        isHighlighted && 'node-highlighted border-purple-400/60 ring-2 ring-purple-400/25 shadow-lg shadow-purple-500/15',
        isCompleted && !isHighlighted && 'node-completed border-green-500/40',
        !isHighlighted && !isCompleted && selected  && 'border-purple-500/50 ring-2 ring-purple-500/20 shadow-md shadow-purple-500/10',
        !isHighlighted && !isCompleted && !selected && 'border-th-border hover:border-purple-500/35 hover:shadow-node-hover hover:-translate-y-px',
      )}
    >
      {/* Purple accent strip */}
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-purple-600 via-violet-500 to-purple-500 opacity-80" />

      <Handle type="target" position={Position.Top}
        className="!bg-purple-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />

      <div className="px-4 pt-3 pb-4">
        {/* Type header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-purple-400">
            <AutomatedIcon />
          </div>
          <span className="text-[10px] font-bold text-purple-400/90 uppercase tracking-widest">Automated</span>
        </div>

        {/* Title */}
        <p className="text-[13.5px] font-semibold text-th-text-1 leading-snug truncate mb-1.5">
          {data.title || 'Automated Step'}
        </p>

        {/* Action badge */}
        {data.actionId ? (
          <p className="text-[10px] text-purple-400/80 font-mono truncate flex items-center gap-1.5">
            <span className="text-th-text-3">⚡</span>
            {formatAction(data.actionId)}
          </p>
        ) : (
          <p className="text-[10px] text-th-text-4 italic">No action selected</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        className="!bg-purple-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />
    </div>
  )
})
