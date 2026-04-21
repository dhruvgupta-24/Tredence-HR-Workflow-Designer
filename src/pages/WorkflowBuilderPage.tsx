import { ReactFlowProvider } from '@xyflow/react'
import { Sidebar } from '../components/sidebar'
import { WorkflowCanvas } from '../components/canvas'

export default function WorkflowBuilderPage() {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar - 240px fixed */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Center Canvas - fills remaining space */}
      <div className="flex-1 min-w-0">
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      </div>

      {/* Right Panel - 320px fixed (Drawer + Sandbox wired in Prompts 08-12) */}
      <div className="w-80 flex-shrink-0 bg-gray-950 border-l border-gray-800 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-20">☰</div>
            <p className="text-xs text-gray-600">
              Click any node to edit its properties
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
