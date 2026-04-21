import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { TaskNodeData } from '../../types'
import { Badge } from '../ui'
import { useWorkflowStore } from '../../store'

type TaskNodeType = Node<TaskNodeData>

export const TaskNode = memo(function TaskNode({ id, data, selected }: NodeProps<TaskNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)

  return (
    <div
      className={clsx(
        'w-[210px] bg-gray-900 rounded-xl border transition-all duration-150',
        'shadow-lg hover:shadow-blue-900/20',
        isHighlighted && 'node-highlighted border-blue-400 ring-2 ring-blue-400/50',
        !isHighlighted && selected && 'border-blue-500 ring-2 ring-blue-500/30',
        !isHighlighted && !selected && 'border-gray-700/80 hover:border-gray-600',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !border-blue-900 !w-3 !h-3" />
      <div className="px-3.5 pt-3.5 pb-3.5">
        <div className="mb-2.5">
          <Badge color="blue">Task</Badge>
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug truncate">
          {data.title || 'Untitled'}
        </p>
        {data.assignee && (
          <p className="text-xs text-gray-400 mt-1.5 truncate">{data.assignee}</p>
        )}
        {data.dueDate && (
          <p className="text-xs text-gray-600 mt-0.5 font-mono">{data.dueDate}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !border-blue-900 !w-3 !h-3" />
    </div>
  )
})
