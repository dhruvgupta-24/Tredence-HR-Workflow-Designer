import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { ApprovalNodeData } from '../../types'
import { Badge } from '../ui'
import { useWorkflowStore } from '../../store'

type ApprovalNodeType = Node<ApprovalNodeData>

export const ApprovalNode = memo(function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)

  return (
    <div
      className={clsx(
        'w-[210px] bg-gray-900 rounded-xl border transition-all duration-150',
        'shadow-lg hover:shadow-orange-900/20',
        isHighlighted && 'node-highlighted border-orange-400 ring-2 ring-orange-400/50',
        !isHighlighted && selected && 'border-orange-500 ring-2 ring-orange-500/30',
        !isHighlighted && !selected && 'border-gray-700/80 hover:border-gray-600',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !border-orange-900 !w-3 !h-3" />
      <div className="px-3.5 pt-3.5 pb-3.5">
        <div className="mb-2.5">
          <Badge color="orange">Approval</Badge>
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug truncate">
          {data.title || 'Untitled'}
        </p>
        <p className="text-xs text-orange-400/90 mt-1.5 font-medium">{data.approverRole}</p>
        {data.autoApproveThreshold > 0 && (
          <p className="text-xs text-gray-600 mt-0.5">Auto-approve at {data.autoApproveThreshold}%</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !border-orange-900 !w-3 !h-3" />
    </div>
  )
})
