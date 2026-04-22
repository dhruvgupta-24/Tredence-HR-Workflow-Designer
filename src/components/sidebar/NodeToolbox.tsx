import { DraggableNode } from './DraggableNode'

const StartIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
)

const TaskIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3 8-8"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const ApprovalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const AutomatedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const EndIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none"/>
  </svg>
)

const NODE_TYPES = [
  { type: 'start',     label: 'Start',          description: 'Trigger point',    icon: <StartIcon />,    color: 'green'  },
  { type: 'task',      label: 'Task',            description: 'Human action',     icon: <TaskIcon />,     color: 'blue'   },
  { type: 'approval',  label: 'Approval Gate',   description: 'Decision step',    icon: <ApprovalIcon />, color: 'orange' },
  { type: 'automated', label: 'Automated Step',  description: 'System action',    icon: <AutomatedIcon />,color: 'purple' },
  { type: 'end',       label: 'End',             description: 'Workflow complete', icon: <EndIcon />,      color: 'red'    },
] as const

export function NodeToolbox() {
  return (
    <div className="flex flex-col gap-1.5">
      {NODE_TYPES.map((node) => (
        <DraggableNode
          key={node.type}
          type={node.type}
          label={node.label}
          description={node.description}
          icon={node.icon}
          color={node.color}
        />
      ))}
    </div>
  )
}
