import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { EndNodeData } from '../../types'
import { Badge } from '../ui'

type EndNodeType = Node<EndNodeData>

export const EndNode = memo(function EndNode({
  data,
  selected,
}: NodeProps<EndNodeType>) {
  const message =
    data.endMessage.length > 30
      ? data.endMessage.slice(0, 30) + '...'
      : data.endMessage

  return (
    <div
      className={clsx(
        'w-[200px] bg-gray-800 rounded-lg shadow-lg border transition-all duration-150',
        selected
          ? 'border-red-500 ring-2 ring-red-500/40'
          : 'border-gray-700 hover:border-gray-500',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !border-red-400 !w-3 !h-3"
      />
      <div className="px-3 pt-3 pb-3">
        <div className="mb-2">
          <Badge color="red">End</Badge>
        </div>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {data.title || 'Untitled'}
        </p>
        {message && (
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  )
})
