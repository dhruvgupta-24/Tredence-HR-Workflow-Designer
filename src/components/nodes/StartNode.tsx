import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { StartNodeData } from '../../types'
import { Badge } from '../ui'

type StartNodeType = Node<StartNodeData>

export const StartNode = memo(function StartNode({
  data,
  selected,
}: NodeProps<StartNodeType>) {
  return (
    <div
      className={clsx(
        'w-[200px] bg-gray-800 rounded-lg shadow-lg border transition-all duration-150',
        selected
          ? 'border-green-500 ring-2 ring-green-500/40'
          : 'border-gray-700 hover:border-gray-500',
      )}
    >
      <div className="px-3 pt-3 pb-3">
        <div className="mb-2">
          <Badge color="green">Start</Badge>
        </div>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {data.title || 'Untitled'}
        </p>
        {data.metadata.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {data.metadata.length} field{data.metadata.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-400 !w-3 !h-3"
      />
    </div>
  )
})
