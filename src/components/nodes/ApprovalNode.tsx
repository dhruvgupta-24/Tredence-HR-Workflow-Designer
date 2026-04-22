import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { ApprovalNodeData } from '../../types'
import { useWorkflowStore } from '../../store'

type ApprovalNodeType = Node<ApprovalNodeData>

const ApprovalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export const ApprovalNode = memo(function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const isCompleted   = useWorkflowStore((s) => s.completedNodeIds?.includes(id) ?? false)

  return (
    <>
      <div
        className={clsx(
          'w-[240px] rounded-[15px] border transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden',
          'bg-th-bg-2 shadow-node',
          isHighlighted && 'node-highlighted border-orange-400/60 ring-2 ring-orange-400/25 shadow-lg shadow-orange-500/15',
          isCompleted && !isHighlighted && 'node-completed border-green-500/40',
          !isHighlighted && !isCompleted && selected  && 'border-orange-500/50 ring-2 ring-orange-500/20 shadow-md shadow-orange-500/10',
          !isHighlighted && !isCompleted && !selected && 'border-th-border hover:border-orange-500/35 hover:shadow-node-hover hover:-translate-y-px',
        )}
      >
        {/* Orange accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 opacity-80" />


      <div className="px-4 pt-3 pb-4">
        {/* Type header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-500/15 flex items-center justify-center flex-shrink-0 text-orange-400">
              <ApprovalIcon />
            </div>
            <span className="text-[10px] font-bold text-orange-400/90 uppercase tracking-widest">Approval</span>
          </div>
          {data.autoApproveThreshold > 0 && (
            <span className="text-[9px] text-amber-500/80 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-md">
              Auto {data.autoApproveThreshold}%
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[13.5px] font-semibold text-th-text-1 leading-snug truncate mb-1.5">
          {data.title || 'Untitled Approval'}
        </p>

        {/* Approver role */}
        <p className="text-[11px] text-orange-400/80 font-medium flex items-center gap-1.5">
          <span className="opacity-50 text-th-text-3">via</span>
          {data.approverRole}
        </p>
      </div>

      </div>

      <Handle type="target" position={Position.Top}
        className="!bg-orange-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />
      <Handle type="source" position={Position.Bottom}
        className="!bg-orange-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />
    </>
  )
})
