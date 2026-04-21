import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { TaskNodeData } from '../../types'
import { Badge } from '../ui'

type TaskNodeType = Node<TaskNodeData>

export const TaskNode = memo(function TaskNode({
  data,
  selected,
}: NodeProps<TaskNodeType>) {
  return (
    <div
      className={clsx(
        'w-[200px] bg-gray-800 rounded-lg shadow-lg border transition-all duration-150',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/40'
          : 'border-gray-700 hover:border-gray-500',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-blue-400 !w-3 !h-3"
      />
      <div className="px-3 pt-3 pb-3">
        <div className="mb-2">
          <Badge color="blue">Task</Badge>
        </div>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {data.title || 'Untitled'}
        </p>
        <p className="text-xs text-gray-400 mt-1.5 truncate">
          {data.assignee || 'Unassigned'}
        </p>
        {data.dueDate && (
          <p className="text-xs text-gray-500 mt-0.5">{data.dueDate}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-blue-400 !w-3 !h-3"
      />
    </div>
  )
})
