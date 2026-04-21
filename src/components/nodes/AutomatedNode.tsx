import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { AutomatedNodeData } from '../../types'
import { Badge } from '../ui'
import { useWorkflowStore } from '../../store'

type AutomatedNodeType = Node<AutomatedNodeData>

export const AutomatedNode = memo(function AutomatedNode({ id, data, selected }: NodeProps<AutomatedNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)

  return (
    <div
      className={clsx(
        'w-[210px] bg-gray-900 rounded-xl border transition-all duration-150',
        'shadow-lg hover:shadow-purple-900/20',
        isHighlighted && 'node-highlighted border-purple-400 ring-2 ring-purple-400/50',
        !isHighlighted && selected && 'border-purple-500 ring-2 ring-purple-500/30',
        !isHighlighted && !selected && 'border-gray-700/80 hover:border-gray-600',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !border-purple-900 !w-3 !h-3" />
      <div className="px-3.5 pt-3.5 pb-3.5">
        <div className="mb-2.5">
          <Badge color="purple">Automated</Badge>
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug truncate">
          {data.title || 'Untitled'}
        </p>
        {data.actionId && (
          <p className="text-xs text-purple-400/80 mt-1.5 truncate font-mono">{data.actionId}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !border-purple-900 !w-3 !h-3" />
    </div>
  )
})
