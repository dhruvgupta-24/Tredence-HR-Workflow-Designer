import { ReactFlowProvider } from '@xyflow/react'
import { useWorkflowStore } from '../store'
import { useAutomations } from '../hooks/useAutomations'
import { Sidebar } from '../components/sidebar'
import { WorkflowCanvas } from '../components/canvas'
import { Drawer } from '../components/ui'
import { SandboxPanel } from '../components/sandbox'
import {
  StartNodeForm,
  TaskNodeForm,
  ApprovalNodeForm,
  AutomatedNodeForm,
  EndNodeForm,
} from '../components/forms'

function NodeFormRouter({ nodeId, type }: { nodeId: string; type: string }) {
  switch (type) {
    case 'start':
      return <StartNodeForm nodeId={nodeId} />
    case 'task':
      return <TaskNodeForm nodeId={nodeId} />
    case 'approval':
      return <ApprovalNodeForm nodeId={nodeId} />
    case 'automated':
      return <AutomatedNodeForm nodeId={nodeId} />
    case 'end':
      return <EndNodeForm nodeId={nodeId} />
    default:
      return (
        <p className="text-xs text-gray-500">No properties for this node type.</p>
      )
  }
}

export default function WorkflowBuilderPage() {
  useAutomations()

  const nodes = useWorkflowStore((s) => s.nodes)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : undefined

  const drawerTitle = selectedNode
    ? String(selectedNode.data.title || selectedNode.type || 'Node')
    : ''

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Center Canvas */}
      <div className="flex-1 min-w-0">
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      </div>

      {/* Right Panel - Sandbox (always visible) */}
      <div className="w-80 flex-shrink-0 border-l border-gray-800 flex flex-col bg-gray-950">
        <SandboxPanel />
      </div>

      {/* Properties Drawer - fixed overlay, slides over right panel when node selected */}
      <Drawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={drawerTitle}
      >
        {selectedNode && (
          <NodeFormRouter nodeId={selectedNode.id} type={selectedNode.type ?? ''} />
        )}
      </Drawer>
    </div>
  )
}
