import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { StartNodeData } from '../../types'
import { Badge } from '../ui'
import { useWorkflowStore } from '../../store'

type StartNodeType = Node<StartNodeData>

export const StartNode = memo(function StartNode({ id, data, selected }: NodeProps<StartNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)

  return (
    <div
      className={clsx(
        'w-[210px] bg-gray-900 rounded-xl border transition-all duration-150',
        'shadow-lg hover:shadow-green-900/20',
        isHighlighted && 'node-highlighted border-green-400 ring-2 ring-green-400/50',
        !isHighlighted && selected && 'border-green-500 ring-2 ring-green-500/30',
        !isHighlighted && !selected && 'border-gray-700/80 hover:border-gray-600',
      )}
    >
      <div className="px-3.5 pt-3.5 pb-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <Badge color="green">Start</Badge>
          {data.metadata.length > 0 && (
            <span className="text-xs text-gray-500 font-mono">{data.metadata.length} fields</span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug truncate">
          {data.title || 'Untitled'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-800 !w-3 !h-3"
      />
    </div>
  )
})
