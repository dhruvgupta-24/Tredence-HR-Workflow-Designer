import { DraggableNode } from './DraggableNode'

const NODE_TYPES = [
  { type: 'start',     label: 'Start Node',     icon: '▶', color: 'green' },
  { type: 'task',      label: 'Task',           icon: '✓', color: 'blue' },
  { type: 'approval',  label: 'Approval Gate',  icon: '⬡', color: 'orange' },
  { type: 'automated', label: 'Automated Step', icon: '⚡', color: 'purple' },
  { type: 'end',       label: 'End Node',       icon: '■', color: 'red' },
] as const

export function NodeToolbox() {
  return (
    <div className="flex flex-col gap-1.5">
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
  )
}
