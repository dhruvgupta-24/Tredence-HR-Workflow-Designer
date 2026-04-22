import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import clsx from 'clsx'
import type { TaskNodeData } from '../../types'
import { useWorkflowStore } from '../../store'

type TaskNodeType = Node<TaskNodeData>

const TaskIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M9 11l3 3 8-8"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

export const TaskNode = memo(function TaskNode({ id, data, selected }: NodeProps<TaskNodeType>) {
  const isHighlighted = useWorkflowStore((s) => s.highlightedNodeId === id)
  const isCompleted   = useWorkflowStore((s) => s.completedNodeIds?.includes(id) ?? false)

  return (
    <div
      className={clsx(
        'w-[240px] rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
        'bg-th-bg-2 shadow-node',
        isHighlighted && 'node-highlighted border-blue-400/60 ring-2 ring-blue-400/25 shadow-lg shadow-blue-500/15',
        isCompleted && !isHighlighted && 'node-completed border-green-500/40',
        !isHighlighted && !isCompleted && selected  && 'border-blue-500/50 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10',
        !isHighlighted && !isCompleted && !selected && 'border-th-border hover:border-blue-500/35 hover:shadow-node-hover hover:-translate-y-px',
      )}
    >
      {/* Blue accent strip */}
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80" />

      <Handle type="target" position={Position.Top}
        className="!bg-blue-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />

      <div className="px-4 pt-3 pb-4">
        {/* Type header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center flex-shrink-0 text-blue-400">
            <TaskIcon />
          </div>
          <span className="text-[10px] font-bold text-blue-400/90 uppercase tracking-widest">Task</span>
        </div>

        {/* Title */}
        <p className="text-[13.5px] font-semibold text-th-text-1 leading-snug truncate mb-1.5">
          {data.title || 'Untitled Task'}
        </p>

        {/* Assignee */}
        {data.assignee && (
          <p className="text-[11px] text-th-text-2 truncate flex items-center gap-1.5">
            <span className="opacity-50">→</span>
            {data.assignee}
          </p>
        )}

        {/* Due date */}
        {data.dueDate && (
          <p className="text-[10px] text-th-text-3 mt-1 font-mono tabular-nums">{data.dueDate}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        className="!bg-blue-500 !border-2 !border-th-bg-2 !w-3.5 !h-3.5"
      />
    </div>
  )
})
