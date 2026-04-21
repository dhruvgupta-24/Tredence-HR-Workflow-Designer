import { DraggableNode } from './DraggableNode'

const NODE_TYPES = [
  { type: 'start', label: 'Start', icon: '▶', color: 'green' },
  { type: 'task', label: 'Task', icon: '✓', color: 'blue' },
  { type: 'approval', label: 'Approval Gate', icon: '⬡', color: 'orange' },
  { type: 'automated', label: 'Automated Step', icon: '⚡', color: 'purple' },
  { type: 'end', label: 'End', icon: '■', color: 'red' },
] as const

export function NodeToolbox() {
  return (
    <div className="px-3 py-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-1">
        Node Types
      </p>
      <div className="flex flex-col gap-2">
        {NODE_TYPES.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.label}
            icon={node.icon}
            color={node.color}
          />
        ))}
      </div>
    </div>
  )
}
