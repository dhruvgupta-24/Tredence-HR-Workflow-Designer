import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { AutomatedNodeData } from '../../types'
import { Badge } from '../ui'

type AutomatedNodeType = Node<AutomatedNodeData>

export const AutomatedNode = memo(function AutomatedNode({
  data,
  selected,
}: NodeProps<AutomatedNodeType>) {
  return (
    <div
      className={clsx(
        'w-[200px] bg-gray-800 rounded-lg shadow-lg border transition-all duration-150',
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/40'
          : 'border-gray-700 hover:border-gray-500',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !border-purple-400 !w-3 !h-3"
      />
      <div className="px-3 pt-3 pb-3">
        <div className="mb-2">
          <Badge color="purple">Automated</Badge>
        </div>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {data.title || 'Untitled'}
        </p>
        <p className="text-xs text-gray-400 mt-1.5 truncate">
          {data.actionId || 'No action selected'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !border-purple-400 !w-3 !h-3"
      />
    </div>
  )
})
