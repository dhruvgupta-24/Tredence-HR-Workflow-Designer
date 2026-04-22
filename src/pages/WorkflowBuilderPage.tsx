import { useState, useEffect, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useWorkflowStore } from '../store'
import { useAutomations } from '../hooks/useAutomations'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { useAutosave } from '../hooks/useAutosave'
import { useSimulate } from '../hooks/useSimulate'
import { useLiveDemo } from '../hooks/useLiveDemo'
import { useTutorial } from '../hooks/useTutorial'
import { Sidebar } from '../components/sidebar'
import { WorkflowCanvas, CanvasControls, StatusBar } from '../components/canvas'
import { Drawer, Modal, ResizeHandle } from '../components/ui'
import { ToastContainer } from '../components/ui/Toast'
import { SandboxPanel } from '../components/sandbox'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { AnalyticsBar } from '../components/analytics/AnalyticsBar'
import { CopilotModal } from '../components/copilot/CopilotModal'
import { CommandPalette } from '../components/command/CommandPalette'
import { DemoOverlay } from '../components/demo/DemoOverlay'
import { FakeCursor } from '../components/demo/FakeCursor'
import { TutorialOverlay, TutorialPicker } from '../components/demo/TutorialOverlay'
import type { LiveDemoPhase } from '../components/demo/DemoOverlay'
import {
  StartNodeForm, TaskNodeForm, ApprovalNodeForm, AutomatedNodeForm, EndNodeForm,
} from '../components/forms'
import { TEMPLATES } from '../data/templates'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'],        action: 'Run simulation' },
  { keys: ['Ctrl', 'K'],            action: 'Open command palette' },
  { keys: ['Ctrl', 'Z'],            action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'],   action: 'Redo' },
  { keys: ['Del', '⌫'],             action: 'Delete selected node' },
  { keys: ['Esc'],                   action: 'Deselect or close' },
  { keys: ['?'],                     action: 'Open this panel' },
  { keys: ['Drag'],                  action: 'Pan canvas' },
  { keys: ['Scroll'],                action: 'Zoom in/out' },
  { keys: ['Click node'],            action: 'Open properties panel' },
]

function ShortcutsContent() {
  return (
    <div className="space-y-2">
      {SHORTCUTS.map(({ keys, action }) => (
        <div key={action} className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">{action}</span>
          <div className="flex items-center gap-1">
            {keys.map((k) => (
              <kbd key={k} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300 leading-tight">{k}</kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function NodeFormRouter({ nodeId, type }: { nodeId: string; type: string }) {
  switch (type) {
    case 'start':     return <StartNodeForm    nodeId={nodeId} />
    case 'task':      return <TaskNodeForm     nodeId={nodeId} />
    case 'approval':  return <ApprovalNodeForm nodeId={nodeId} />
    case 'automated': return <AutomatedNodeForm nodeId={nodeId} />
    case 'end':       return <EndNodeForm      nodeId={nodeId} />
    default:          return <p className="text-xs text-gray-500">No properties for this node type.</p>
  }
}

export default function WorkflowBuilderPage() {
  useAutomations()
  useAutosave()

  const { runSimulation } = useSimulate()

  const nodes          = useWorkflowStore((s) => s.nodes)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const setNodes       = useWorkflowStore((s) => s.setNodes)
  const setEdges       = useWorkflowStore((s) => s.setEdges)
  const workflowName   = useWorkflowStore((s) => s.workflowName)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const sidebarWidth   = useWorkflowStore((s) => s.sidebarWidth)
  const sandboxWidth   = useWorkflowStore((s) => s.sandboxWidth)
  const setSidebarWidth = useWorkflowStore((s) => s.setSidebarWidth)
  const setSandboxWidth = useWorkflowStore((s) => s.setSandboxWidth)

  const leftPanel = useResizablePanel({
    currentWidth: sidebarWidth,
    minWidth: 260,
    maxWidth: 520,
    defaultWidth: 260,
    onWidthChange: setSidebarWidth,
    side: 'left',
  })

  const rightPanel = useResizablePanel({
    currentWidth: sandboxWidth,
    minWidth: 320,
    maxWidth: 700,
    defaultWidth: 320,
    onWidthChange: setSandboxWidth,
    side: 'right',
  })

  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCopilot,   setShowCopilot]   = useState(false)
  const [showCommand,   setShowCommand]   = useState(false)

  // Live Demo state
  const [demoPhase, setDemoPhase]   = useState<LiveDemoPhase>('idle')
  const [demoLabel, setDemoLabel]   = useState('')

  const { runDemo, cancelDemo, isRunning: isLiveDemoRunning, cursor } = useLiveDemo({
    onPhaseChange:  setDemoPhase,
    onStepLabel:    setDemoLabel,
    onOpenCopilot:  () => setShowCopilot(true),
    onCloseCopilot: () => setShowCopilot(false),
  })

  // Tutorial state
  const tutorial = useTutorial()

  // When tutorial advances to the run-workflow step, close any open drawer
  // so the spotlight is not visually obscured by the properties panel backdrop.
  useEffect(() => {
    if (tutorial.isActive && tutorial.spotlightTarget === 'run-workflow') {
      setSelectedNode(null)
    }
  }, [tutorial.isActive, tutorial.spotlightTarget, setSelectedNode])

  // Seed template on first visit (only when nothing was restored from localStorage)
  const seededRef = useRef(false)
  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    if (nodes.length === 0) {
      const tpl = TEMPLATES[0]!
      setNodes(tpl.nodes as WorkflowNode[])
      setEdges(tpl.edges as Edge[])
      // Only set the name if there is no persisted name (fresh session)
      if (!workflowName) setWorkflowName(tpl.name)
      triggerFitView()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useUndoRedo(setShowShortcuts)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommand((v) => !v)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        void runSimulation()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [runSimulation])

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : undefined
  const drawerTitle  = selectedNode ? String(selectedNode.data.title || selectedNode.type || 'Node') : ''

  return (
    <div className="app-root flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* Left Sidebar */}
      <div 
        style={{ width: `${sidebarWidth}px` }} 
        className="flex-shrink-0 relative hidden md:block"
      >
        <Sidebar />
        <ResizeHandle
          side="left"
          isDragging={leftPanel.isDragging}
          onPointerDown={leftPanel.onPointerDown}
          onDoubleClick={leftPanel.onDoubleClick}
        />
      </div>
      <div className="w-60 flex-shrink-0 hidden sm:block md:hidden">
        <Sidebar />
      </div>

      {/* Center */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        <CanvasControls
          onShortcutsOpen={() => setShowShortcuts(true)}
          onCopilotOpen={() => setShowCopilot(true)}
          onCommandOpen={() => setShowCommand(true)}
          onLiveDemoRun={() => void runDemo()}
          onTutorialStart={() => tutorial.openPicker()}
          isLiveDemoRunning={isLiveDemoRunning}
          isTutorialActive={tutorial.isActive}
        />
        <StatusBar />

        {/* Canvas + overlays */}
        <div className="flex-1 min-h-0 relative">
          <ReactFlowProvider>
            <WorkflowCanvas />
          </ReactFlowProvider>

          {/* Live Demo overlay */}
          <DemoOverlay
            phase={demoPhase}
            stepLabel={demoLabel}
            onSkipIntro={() => { /* intro auto-continues after 2.6s */ }}
            onTryCopilot={() => { cancelDemo(); setDemoPhase('idle'); setShowCopilot(true) }}
            onBuildOwn={() => { cancelDemo(); setDemoPhase('idle') }}
          />
        </div>

        <AnalyticsBar />
      </div>

      {/* Right Panel */}
      <div 
        style={{ width: `${sandboxWidth}px` }}
        className="flex-shrink-0 border-l border-gray-800/80 flex flex-col bg-gray-950 relative hidden lg:flex"
      >
        <ResizeHandle
          side="right"
          isDragging={rightPanel.isDragging}
          onPointerDown={rightPanel.onPointerDown}
          onDoubleClick={rightPanel.onDoubleClick}
        />
        <SandboxPanel />
      </div>
      <div className="w-80 flex-shrink-0 border-l border-gray-800/80 flex-col bg-gray-950 hidden sm:flex lg:hidden">
        <SandboxPanel />
      </div>

      {/* Properties Drawer */}
      <Drawer isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} title={drawerTitle}>
        {selectedNode && <NodeFormRouter nodeId={selectedNode.id} type={selectedNode.type ?? ''} />}
      </Drawer>

      {/* Keyboard Shortcuts Modal */}
      <Modal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard Shortcuts">
        <ShortcutsContent />
      </Modal>

      {/* AI Copilot Modal */}
      <CopilotModal isOpen={showCopilot} onClose={() => setShowCopilot(false)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommand}
        onClose={() => setShowCommand(false)}
        onRunSimulation={() => void runSimulation()}
        onOpenCopilot={() => { setShowCommand(false); setShowCopilot(true) }}
        onOpenShortcuts={() => { setShowCommand(false); setShowShortcuts(true) }}
      />

      {/* Tutorial overlay - fixed bottom-right card */}
      <TutorialOverlay
        isActive={tutorial.isActive}
        isDone={tutorial.isDone}
        step={tutorial.step}
        totalSteps={tutorial.totalSteps}
        stepTitle={tutorial.stepTitle}
        stepHint={tutorial.stepHint}
        stepIcon={tutorial.stepIcon}
        ghost={tutorial.ghost}
        spotlightTarget={tutorial.spotlightTarget}
        onCancel={tutorial.cancelTutorial}
        onNext={tutorial.nextStep}
        onBack={tutorial.prevStep}
        onBuildOwn={tutorial.cancelTutorial}
        onTryCopilot={() => { tutorial.cancelTutorial(); setShowCopilot(true) }}
      />

      {/* Tutorial picker modal */}
      {tutorial.showPicker && (
        <TutorialPicker
          onSelect={(type) => tutorial.startTutorial(type)}
          onClose={tutorial.cancelTutorial}
        />
      )}

      {/* Fake cursor for Live Demo */}
      <FakeCursor state={cursor} />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}
