import { useState, useEffect, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useWorkflowStore } from '../store'
import { useAutomations } from '../hooks/useAutomations'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { useAutosave } from '../hooks/useAutosave'
import { useSimulate } from '../hooks/useSimulate'
import { useGuidedDemo } from '../hooks/useGuidedDemo'
import { Sidebar } from '../components/sidebar'
import { WorkflowCanvas, CanvasControls, StatusBar } from '../components/canvas'
import { Drawer, Modal } from '../components/ui'
import { ToastContainer } from '../components/ui/Toast'
import { SandboxPanel } from '../components/sandbox'
import { AnalyticsBar } from '../components/analytics/AnalyticsBar'
import { CopilotModal } from '../components/copilot/CopilotModal'
import { CommandPalette } from '../components/command/CommandPalette'
import {
  StartNodeForm,
  TaskNodeForm,
  ApprovalNodeForm,
  AutomatedNodeForm,
  EndNodeForm,
} from '../components/forms'
import { TEMPLATES } from '../data/templates'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

// ── Keyboard shortcuts list ───────────────────────────────────
const SHORTCUTS = [
  { keys: ['Ctrl', 'K'],          action: 'Open command palette' },
  { keys: ['Ctrl', 'Z'],          action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Del', '⌫'],           action: 'Delete selected node' },
  { keys: ['Esc'],                 action: 'Deselect / close' },
  { keys: ['?'],                   action: 'Open shortcuts panel' },
  { keys: ['Drag'],                action: 'Pan canvas' },
  { keys: ['Scroll'],              action: 'Zoom in/out' },
  { keys: ['Click'],               action: 'Select node → open properties' },
]

function ShortcutsContent() {
  return (
    <div className="space-y-2">
      {SHORTCUTS.map(({ keys, action }) => (
        <div key={action} className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">{action}</span>
          <div className="flex items-center gap-1">
            {keys.map((k) => (
              <kbd key={k} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300 leading-tight">
                {k}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Form router ───────────────────────────────────────────────
function NodeFormRouter({ nodeId, type }: { nodeId: string; type: string }) {
  switch (type) {
    case 'start':     return <StartNodeForm    nodeId={nodeId} />
    case 'task':      return <TaskNodeForm     nodeId={nodeId} />
    case 'approval':  return <ApprovalNodeForm nodeId={nodeId} />
    case 'automated': return <AutomatedNodeForm nodeId={nodeId} />
    case 'end':       return <EndNodeForm      nodeId={nodeId} />
    default:
      return <p className="text-xs text-gray-500">No properties for this node type.</p>
  }
}

// ── Main Page ─────────────────────────────────────────────────
export default function WorkflowBuilderPage() {
  useAutomations()
  useAutosave()

  const { runSimulation } = useSimulate()

  const nodes        = useWorkflowStore((s) => s.nodes)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const setNodes     = useWorkflowStore((s) => s.setNodes)
  const setEdges     = useWorkflowStore((s) => s.setEdges)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)

  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCopilot,   setShowCopilot]   = useState(false)
  const [showCommand,   setShowCommand]   = useState(false)

  const { runDemo, isDemoRunning } = useGuidedDemo({
    onOpenCopilot:  () => setShowCopilot(true),
    onCloseCopilot: () => setShowCopilot(false),
  })

  // Seed Employee Onboarding on first-ever visit
  const seededRef = useRef(false)
  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    if (nodes.length === 0) {
      const tpl = TEMPLATES[0]!
      setNodes(tpl.nodes as WorkflowNode[])
      setEdges(tpl.edges as Edge[])
      triggerFitView()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Global keyboard shortcuts
  useUndoRedo(setShowShortcuts)

  // Ctrl+K → command palette (separate effect to keep useUndoRedo clean)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommand((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : undefined

  const drawerTitle = selectedNode
    ? String(selectedNode.data.title || selectedNode.type || 'Node')
    : ''

  return (
    <div className="app-root flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Center — Toolbar + Status + Canvas + Analytics */}
      <div className="flex-1 min-w-0 flex flex-col">
        <CanvasControls
          onShortcutsOpen={() => setShowShortcuts(true)}
          onCopilotOpen={() => setShowCopilot(true)}
          onCommandOpen={() => setShowCommand(true)}
          onDemoRun={() => void runDemo()}
          isDemoRunning={isDemoRunning}
        />
        <StatusBar />
        <div className="flex-1 min-h-0">
          <ReactFlowProvider>
            <WorkflowCanvas />
          </ReactFlowProvider>
        </div>
        <AnalyticsBar />
      </div>

      {/* Right Panel — Simulation Sandbox */}
      <div className="w-80 flex-shrink-0 border-l border-gray-800/80 flex flex-col bg-gray-950">
        <SandboxPanel />
      </div>

      {/* Properties Drawer */}
      <Drawer isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} title={drawerTitle}>
        {selectedNode && (
          <NodeFormRouter nodeId={selectedNode.id} type={selectedNode.type ?? ''} />
        )}
      </Drawer>

      {/* Keyboard Shortcuts Modal */}
      <Modal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard Shortcuts">
        <ShortcutsContent />
      </Modal>

      {/* AI Copilot Modal */}
      <CopilotModal isOpen={showCopilot} onClose={() => setShowCopilot(false)} />

      {/* Ctrl+K Command Palette */}
      <CommandPalette
        isOpen={showCommand}
        onClose={() => setShowCommand(false)}
        onRunSimulation={() => void runSimulation()}
        onOpenCopilot={() => { setShowCommand(false); setShowCopilot(true) }}
        onOpenShortcuts={() => { setShowCommand(false); setShowShortcuts(true) }}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}
