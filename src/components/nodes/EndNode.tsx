import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { EndNodeData } from '../../types'
import { Badge } from '../ui'
import { useWorkflowStore } from '../../store'

type EndNodeType = Node<EndNodeData>

export const EndNode = memo(function EndNode({ id, data, selected }: NodeProps<EndNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const preview = data.endMessage.length > 40
    ? data.endMessage.slice(0, 40) + '…'
    : data.endMessage

  return (
    <div
      className={clsx(
        'w-[210px] bg-gray-900 rounded-xl border transition-all duration-150',
        'shadow-lg hover:shadow-red-900/20',
        isHighlighted && 'node-highlighted border-red-400 ring-2 ring-red-400/50',
        !isHighlighted && selected && 'border-red-500 ring-2 ring-red-500/30',
        !isHighlighted && !selected && 'border-gray-700/80 hover:border-gray-600',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-500 !border-red-900 !w-3 !h-3" />
      <div className="px-3.5 pt-3.5 pb-3.5">
        <div className="mb-2.5">
          <Badge color="red">End</Badge>
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug truncate">
          {data.title || 'Untitled'}
        </p>
        {preview && (
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{preview}</p>
        )}
      </div>
    </div>
  )
})
