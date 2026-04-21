import { useState, useCallback, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { simulateWorkflow } from '../api/simulate'
import { toast } from '../store/toastStore'
import { getDemoTarget, getCanvasDropPositions } from '../utils/demoPositions'
import type { CursorState, CursorMode } from '../components/demo/FakeCursor'
import type { LiveDemoPhase } from '../components/demo/DemoOverlay'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

// ── Demo workflow (4-node linear chain, guaranteed valid) ─────────────────────
const mkNode = (id: string, type: string, pos: {x:number;y:number}, data: Record<string, unknown>): WorkflowNode =>
  ({ id, type, position: pos, data } as WorkflowNode)

const mkEdge = (id: string, source: string, target: string): Edge =>
  ({ id, source, target, animated: true, style: { strokeWidth: 2, stroke: '#6366f1' } })

const DEMO_NODES: WorkflowNode[] = [
  mkNode('ld-1', 'start',    { x: 300, y: 50  }, { title: 'Request Initiated', metadata: [] }),
  mkNode('ld-2', 'task',     { x: 300, y: 230 }, { title: 'Review Documents',  assignee: 'HR Team', description: 'Employee submits joining forms', dueDate: '', customFields: [] }),
  mkNode('ld-3', 'approval', { x: 300, y: 410 }, { title: 'Manager Approval',  approverRole: 'Manager', autoApproveThreshold: 0 }),
  mkNode('ld-4', 'end',      { x: 300, y: 590 }, { title: 'Workflow Complete', endMessage: 'All steps completed successfully!', showSummary: true }),
]
const DEMO_EDGES: Edge[] = [
  mkEdge('ld-e1', 'ld-1', 'ld-2'),
  mkEdge('ld-e2', 'ld-2', 'ld-3'),
  mkEdge('ld-e3', 'ld-3', 'ld-4'),
]

interface DemoCallbacks {
  onPhaseChange: (phase: LiveDemoPhase) => void
  onStepLabel:   (label: string) => void
  onOpenCopilot: () => void
  onCloseCopilot: () => void
}

export function useLiveDemo(cbs: DemoCallbacks) {
  const [isRunning, setIsRunning] = useState(false)
  const [cursor, setCursor]       = useState<CursorState>({ x: 0, y: 0, duration: 0, visible: false, mode: 'normal' })

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

  // ── Helpers ─────────────────────────────────────────────────────────────

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
    await wait(380)
    setCursor((c) => ({ ...c, mode: 'normal' }))
    await wait(120)
  }, [wait])

  // Move to real DOM element center, with pause + overshoot micro-settle
  const moveToTarget = useCallback(async (targetName: string, fallback: {x:number;y:number}, mode: CursorMode = 'normal') => {
    const pos = getDemoTarget(targetName) ?? fallback
    await move(pos.x, pos.y, 850, mode)
    await wait(250)
  }, [move, wait])

  // ── Main script ──────────────────────────────────────────────────────────

  const runDemo = useCallback(async () => {
    if (isRunning) return
    cancelRef.current = false
    setIsRunning(true)

    try {
      // Clear state + show intro overlay for 2.7s
      cbs.onPhaseChange('intro')
      setNodes([])
      setEdges([])
      setSimulationLog([])
      setValidationErrors([])
      clearCompletedNodes()
      setHighlightedNodeId(null)
      await wait(2700)
      if (cancelRef.current) return

      // Query real canvas drop positions at runtime
      const drops = getCanvasDropPositions()
      const d1 = drops[0] ?? { x: 520, y: 220 }
      const d2 = drops[1] ?? { x: 520, y: 370 }
      const d3 = drops[2] ?? { x: 520, y: 520 }
      const d4 = drops[3] ?? { x: 520, y: 650 }

      // Cursor appears over sidebar
      const sbStart = getDemoTarget('node-start') ?? { x: 115, y: 175 }
      setCursor({ x: sbStart.x, y: sbStart.y - 40, duration: 0, visible: true, mode: 'normal' })
      cbs.onPhaseChange('building')

      // ── Place Start ──────────────────────────────────────────────────────
      cbs.onStepLabel('Dragging Start node to canvas...')
      await moveToTarget('node-start', { x: 115, y: 175 }, 'hover')
      await wait(200)
      await move(d1.x, d1.y, 1000, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!])
      await wait(320)

      if (cancelRef.current) return

      // ── Place Task ───────────────────────────────────────────────────────
      cbs.onStepLabel('Adding Task node...')
      await moveToTarget('node-task', { x: 115, y: 220 }, 'hover')
      await wait(180)
      await move(d2.x, d2.y, 950, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!])
      await wait(320)

      if (cancelRef.current) return

      // ── Place Approval ───────────────────────────────────────────────────
      cbs.onStepLabel('Adding Approval gate...')
      await moveToTarget('node-approval', { x: 115, y: 265 }, 'hover')
      await wait(180)
      await move(d3.x, d3.y, 950, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!, DEMO_NODES[2]!])
      await wait(320)

      if (cancelRef.current) return

      // ── Place End ────────────────────────────────────────────────────────
      cbs.onStepLabel('Adding End node...')
      await moveToTarget('node-end', { x: 115, y: 310 }, 'hover')
      await wait(180)
      await move(d4.x, d4.y, 950, 'drag')
      await click()
      setNodes([...DEMO_NODES])
      triggerFitView()
      await wait(700)

      if (cancelRef.current) return

      // ── Connect edges ────────────────────────────────────────────────────
      cbs.onPhaseChange('connecting')

      cbs.onStepLabel('Connecting Start to Task...')
      await move(d1.x, d1.y + 48, 600)   // Start node bottom handle
      await wait(300)
      await move(d2.x, d2.y - 48, 700, 'drag')
      await click()
      setEdges([DEMO_EDGES[0]!])
      await wait(450)

      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Task to Approval...')
      await move(d2.x, d2.y + 48, 600)
      await wait(280)
      await move(d3.x, d3.y - 48, 700, 'drag')
      await click()
      setEdges([DEMO_EDGES[0]!, DEMO_EDGES[1]!])
      await wait(450)

      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Approval to End...')
      await move(d3.x, d3.y + 48, 600)
      await wait(280)
      await move(d4.x, d4.y - 48, 700, 'drag')
      await click()
      setEdges([...DEMO_EDGES])
      await wait(600)

      if (cancelRef.current) return

      // ── Edit Task title ──────────────────────────────────────────────────
      cbs.onPhaseChange('editing')
      cbs.onStepLabel('Clicking task node to edit...')
      await move(d2.x, d2.y, 700)
      await wait(300)
      await click()
      setSelectedNode('ld-2')
      await wait(600)

      cbs.onStepLabel('Setting task name...')
      const title = 'Review Documents'
      for (let i = 1; i <= title.length; i++) {
        if (cancelRef.current) break
        updateNodeData('ld-2', { title: title.slice(0, i) } as Parameters<typeof updateNodeData>[1])
        await wait(55)
      }
      await wait(500)
      setSelectedNode(null)
      await wait(350)

      if (cancelRef.current) return

      // ── Run simulation ───────────────────────────────────────────────────
      cbs.onPhaseChange('simulating')
      cbs.onStepLabel('Running workflow simulation...')

      await moveToTarget('run-workflow', { x: window.innerWidth - 160, y: 120 }, 'hover')
      await click()
      await wait(250)

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
      console.error('[LiveDemo] error:', err)
      toast.error('Demo encountered an error')
      cbs.onPhaseChange('idle')
    } finally {
      setIsRunning(false)
      setIsSimulating(false)
      setHighlightedNodeId(null)
      setCursor((c) => ({ ...c, visible: false }))
    }
  }, [
    isRunning, wait, move, click, moveToTarget,
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
