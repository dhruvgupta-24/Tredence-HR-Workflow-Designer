import { useState, useCallback, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { simulateWorkflow } from '../api/simulate'
import { toast } from '../store/toastStore'
import type { CursorState, CursorMode } from '../components/demo/FakeCursor'
import type { LiveDemoPhase } from '../components/demo/DemoOverlay'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

// ── Demo workflow built step-by-step during Live Demo ────────────────────────
const mkNode = (id: string, type: string, pos: {x:number;y:number}, data: Record<string, unknown>): WorkflowNode =>
  ({ id, type, position: pos, data } as WorkflowNode)

const mkEdge = (id: string, source: string, target: string): Edge =>
  ({ id, source, target, animated: true, style: { strokeWidth: 2, stroke: '#6366f1' } })

const DEMO_NODES: WorkflowNode[] = [
  mkNode('ld-1', 'start',    { x: 300, y: 50  }, { title: 'Request Initiated',  metadata: [] }),
  mkNode('ld-2', 'task',     { x: 300, y: 230 }, { title: 'Review Documents',   assignee: 'HR Team', description: 'Employee submits joining forms', dueDate: '', customFields: [] }),
  mkNode('ld-3', 'approval', { x: 300, y: 410 }, { title: 'Manager Approval',   approverRole: 'Manager', autoApproveThreshold: 0 }),
  mkNode('ld-4', 'end',      { x: 300, y: 590 }, { title: 'Workflow Complete',   endMessage: 'All steps completed successfully!', showSummary: true }),
]
const DEMO_EDGES: Edge[] = [
  mkEdge('ld-e1', 'ld-1', 'ld-2'),
  mkEdge('ld-e2', 'ld-2', 'ld-3'),
  mkEdge('ld-e3', 'ld-3', 'ld-4'),
]

// ── Layout positions for fake cursor ──────────────────────────────────────────
// These are screen-pixel positions based on the known layout:
//   Sidebar: 0-240px wide | Toolbar+Status: 76px tall | Right panel: last 320px
const SB_X = 115   // sidebar center-x
const CV_X = 530   // canvas center-x (approximate)

interface DemoCallbacks {
  onPhaseChange: (phase: LiveDemoPhase) => void
  onStepLabel:   (label: string) => void
  onOpenCopilot: () => void
  onCloseCopilot: () => void
}

export function useLiveDemo(cbs: DemoCallbacks) {
  const [isRunning,    setIsRunning]    = useState(false)
  const [cursor,       setCursor]       = useState<CursorState>({ x: 80, y: 80, duration: 0, visible: false, mode: 'normal' })

  const setNodes             = useWorkflowStore((s) => s.setNodes)
  const setEdges             = useWorkflowStore((s) => s.setEdges)
  const setSelectedNode      = useWorkflowStore((s) => s.setSelectedNode)
  const updateNodeData       = useWorkflowStore((s) => s.updateNodeData)
  const setHighlightedNodeId = useWorkflowStore((s) => s.setHighlightedNodeId)
  const addCompletedNode     = useWorkflowStore((s) => s.addCompletedNode)
  const clearCompletedNodes  = useWorkflowStore((s) => s.clearCompletedNodes)
  const setSimulationLog     = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating      = useWorkflowStore((s) => s.setIsSimulating)
  const setValidationErrors  = useWorkflowStore((s) => s.setValidationErrors)
  const triggerFitView       = useWorkflowStore((s) => s.triggerFitView)

  const cancelRef = useRef(false)

  // ── Helpers ───────────────────────────────────────────────────────────────

  const wait = useCallback((ms: number) =>
    new Promise<void>((res) => {
      const id = setTimeout(res, ms)
      const p  = setInterval(() => { if (cancelRef.current) { clearTimeout(id); clearInterval(p); res() } }, 40)
    }), [])

  const move = useCallback((x: number, y: number, ms: number, mode: CursorMode = 'normal') =>
    new Promise<void>((res) => {
      setCursor({ x, y, duration: ms, visible: true, mode })
      const id = setTimeout(res, ms + 60)
      const p  = setInterval(() => { if (cancelRef.current) { clearTimeout(id); clearInterval(p); res() } }, 40)
    }), [])

  const click = useCallback(async () => {
    setCursor((c) => ({ ...c, mode: 'click' }))
    await wait(400)
    setCursor((c) => ({ ...c, mode: 'normal' }))
  }, [wait])

  // ── Main script ───────────────────────────────────────────────────────────

  const runDemo = useCallback(async () => {
    if (isRunning) return
    cancelRef.current = false
    setIsRunning(true)

    try {
      // Phase 0: intro overlay (2.6s)
      cbs.onPhaseChange('intro')
      setNodes([])
      setEdges([])
      setSimulationLog([])
      setValidationErrors([])
      clearCompletedNodes()
      setHighlightedNodeId(null)
      await wait(2700)
      if (cancelRef.current) return

      // Cursor appears near top of sidebar
      setCursor({ x: SB_X, y: 100, duration: 0, visible: true, mode: 'normal' })
      cbs.onPhaseChange('building')

      // ── Place Start node ─────────────────────────────────────────────────
      cbs.onStepLabel('Dragging Start node to canvas...')
      await move(SB_X, 175, 700)        // hover Start in sidebar
      await wait(350)
      await move(SB_X, 175, 0, 'hover')
      await wait(180)
      await move(CV_X, 200, 1000, 'drag')  // drag to canvas
      await click()
      setNodes([DEMO_NODES[0]!])
      await wait(350)

      if (cancelRef.current) return

      // ── Place Task node ──────────────────────────────────────────────────
      cbs.onStepLabel('Adding Task node...')
      await move(SB_X, 220, 700)
      await wait(300)
      await move(CV_X, 350, 900, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!])
      await wait(350)

      if (cancelRef.current) return

      // ── Place Approval node ──────────────────────────────────────────────
      cbs.onStepLabel('Adding Approval gate...')
      await move(SB_X, 265, 700)
      await wait(280)
      await move(CV_X, 500, 900, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!, DEMO_NODES[2]!])
      await wait(350)

      if (cancelRef.current) return

      // ── Place End node ───────────────────────────────────────────────────
      cbs.onStepLabel('Adding End node...')
      await move(SB_X, 308, 700)
      await wait(280)
      await move(CV_X, 650, 900, 'drag')
      await click()
      setNodes([...DEMO_NODES])
      triggerFitView()
      await wait(700)

      if (cancelRef.current) return

      // ── Connect edges ────────────────────────────────────────────────────
      cbs.onPhaseChange('connecting')
      cbs.onStepLabel('Connecting Start to Task...')
      await move(CV_X, 240, 600)   // near Start out-handle
      await wait(300)
      await move(CV_X, 320, 700, 'drag')  // drag to Task
      await click()
      setEdges([DEMO_EDGES[0]!])
      await wait(500)

      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Task to Approval...')
      await move(CV_X, 420, 600)
      await wait(300)
      await move(CV_X, 500, 700, 'drag')
      await click()
      setEdges([DEMO_EDGES[0]!, DEMO_EDGES[1]!])
      await wait(500)

      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Approval to End...')
      await move(CV_X, 600, 600)
      await wait(300)
      await move(CV_X, 680, 700, 'drag')
      await click()
      setEdges([...DEMO_EDGES])
      await wait(600)

      if (cancelRef.current) return

      // ── Edit task node ───────────────────────────────────────────────────
      cbs.onPhaseChange('editing')
      cbs.onStepLabel('Clicking task to edit properties...')
      await move(CV_X, 350, 700)
      await wait(300)
      await click()
      setSelectedNode('ld-2')
      await wait(600)

      // Simulate typing a new title
      cbs.onStepLabel('Setting task title...')
      const finalTitle = 'Review Documents'
      for (let i = 1; i <= finalTitle.length; i++) {
        if (cancelRef.current) break
        updateNodeData('ld-2', { title: finalTitle.slice(0, i) } as Parameters<typeof updateNodeData>[1])
        await wait(55)
      }
      await wait(500)
      setSelectedNode(null)
      await wait(400)

      if (cancelRef.current) return

      // ── Run simulation ───────────────────────────────────────────────────
      cbs.onPhaseChange('simulating')
      cbs.onStepLabel('Running workflow simulation...')

      // Move cursor to Run Workflow area (right panel)
      const runBtnX = window.innerWidth - 160
      await move(runBtnX, 120, 900)
      await wait(350)
      await click()
      await wait(300)

      const result = await simulateWorkflow(DEMO_NODES, DEMO_EDGES)

      if (result.success && result.steps?.length) {
        setIsSimulating(true)
        let prevId: string | null = null

        for (const step of result.steps) {
          if (cancelRef.current) break
          if (prevId) addCompletedNode(prevId)
          setHighlightedNodeId(step.nodeId)
          cbs.onStepLabel(`Step ${step.step}: ${step.label}`)
          await wait(850)
        }
        const last = result.steps[result.steps.length - 1]
        if (last) addCompletedNode(last.nodeId)
        setHighlightedNodeId(null)
        setIsSimulating(false)
      }

      if (cancelRef.current) return

      // ── Success ──────────────────────────────────────────────────────────
      cbs.onPhaseChange('success')
      toast.success('Built visually. Automated intelligently.')
      setCursor((c) => ({ ...c, visible: false }))

      await wait(8000)
      if (!cancelRef.current) cbs.onPhaseChange('idle')

    } catch (err) {
      console.error('[LiveDemo] script error:', err)
      toast.error('Demo encountered an error')
      cbs.onPhaseChange('idle')
    } finally {
      setIsRunning(false)
      setIsSimulating(false)
      setHighlightedNodeId(null)
      setCursor((c) => ({ ...c, visible: false }))
    }
  }, [
    isRunning, wait, move, click,
    setNodes, setEdges, setSelectedNode, updateNodeData,
    setHighlightedNodeId, addCompletedNode, clearCompletedNodes,
    setSimulationLog, setIsSimulating, setValidationErrors,
    triggerFitView, cbs,
  ])

  const cancelDemo = useCallback(() => {
    cancelRef.current = true
    cbs.onPhaseChange('idle')
    setCursor((c) => ({ ...c, visible: false }))
  }, [cbs])

  return { runDemo, cancelDemo, isRunning, cursor }
}
