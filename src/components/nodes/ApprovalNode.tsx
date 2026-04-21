import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { ApprovalNodeData } from '../../types'
import { Badge } from '../ui'

type ApprovalNodeType = Node<ApprovalNodeData>

export const ApprovalNode = memo(function ApprovalNode({
  data,
  selected,
}: NodeProps<ApprovalNodeType>) {
  return (
    <div
      className={clsx(
        'w-[200px] bg-gray-800 rounded-lg shadow-lg border transition-all duration-150',
        selected
          ? 'border-orange-500 ring-2 ring-orange-500/40'
          : 'border-gray-700 hover:border-gray-500',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !border-orange-400 !w-3 !h-3"
      />
      <div className="px-3 pt-3 pb-3">
        <div className="mb-2">
          <Badge color="orange">Approval</Badge>
        </div>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {data.title || 'Untitled'}
        </p>
        <p className="text-xs text-orange-400/80 mt-1.5">{data.approverRole}</p>
        {data.autoApproveThreshold > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-approve {data.autoApproveThreshold}%
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-orange-500 !border-orange-400 !w-3 !h-3"
      />
    </div>
  )
})
