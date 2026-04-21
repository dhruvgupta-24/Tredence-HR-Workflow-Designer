import { useState, useCallback, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { simulateWorkflow } from '../api/simulate'
import { toast } from '../store/toastStore'
import {
  getDemoTarget,
  getCanvasRect,
  nodeCenter,
  nodeBottomHandle,
  nodeTopHandle,
} from '../utils/demoPositions'
import type { CursorState, CursorMode } from '../components/demo/FakeCursor'
import type { LiveDemoPhase } from '../components/demo/DemoOverlay'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

// ── Demo workflow: 4-node guaranteed-valid linear chain ───────────────────────
const mkNode = (
  id: string,
  type: string,
  pos: { x: number; y: number },
  data: Record<string, unknown>,
): WorkflowNode => ({ id, type, position: pos, data } as WorkflowNode)

const mkEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  animated: true,
  style: { strokeWidth: 2, stroke: '#6366f1' },
})

// RF canvas positions - nodes placed in a neat vertical column
// With viewport {x:0, y:0, zoom:0.82} these map to clean screen positions
const DEMO_RF_ZOOM = 0.82
const DEMO_NODES: WorkflowNode[] = [
  mkNode('ld-1', 'start',    { x: 280, y: 80  }, { title: 'Request Initiated',   metadata: [] }),
  mkNode('ld-2', 'task',     { x: 280, y: 280 }, { title: 'Review Documents',    assignee: 'HR Team', description: 'Employee submits joining forms', dueDate: '', customFields: [] }),
  mkNode('ld-3', 'approval', { x: 280, y: 480 }, { title: 'Manager Approval',    approverRole: 'Manager', autoApproveThreshold: 0 }),
  mkNode('ld-4', 'end',      { x: 280, y: 680 }, { title: 'Workflow Complete',   endMessage: 'All steps completed successfully!', showSummary: true }),
]
const DEMO_EDGES: Edge[] = [
  mkEdge('ld-e1', 'ld-1', 'ld-2'),
  mkEdge('ld-e2', 'ld-2', 'ld-3'),
  mkEdge('ld-e3', 'ld-3', 'ld-4'),
]

// Extract RF positions of each node
const [N1, N2, N3, N4] = DEMO_NODES.map((n) => n.position)

interface DemoCallbacks {
  onPhaseChange:  (phase: LiveDemoPhase) => void
  onStepLabel:    (label: string) => void
  onOpenCopilot:  () => void
  onCloseCopilot: () => void
}

export function useLiveDemo(cbs: DemoCallbacks) {
  const [isRunning, setIsRunning] = useState(false)
  const [cursor, setCursor]       = useState<CursorState>({
    x: 0, y: 0, duration: 0, visible: false, mode: 'normal',
  })

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
  const triggerViewportReset = useWorkflowStore((s) => s.triggerViewportReset)

  const cancelRef = useRef(false)

  // ── Timing helpers ─────────────────────────────────────────────────────────

  const wait = useCallback((ms: number) =>
    new Promise<void>((res) => {
      const id = setTimeout(res, ms)
      const p  = setInterval(() => {
        if (cancelRef.current) { clearTimeout(id); clearInterval(p); res() }
      }, 40)
    }), [])

  const move = useCallback((x: number, y: number, ms: number, mode: CursorMode = 'normal') =>
    new Promise<void>((res) => {
      setCursor({ x, y, duration: ms, visible: true, mode })
      const id = setTimeout(res, ms + 60)
      const p  = setInterval(() => {
        if (cancelRef.current) { clearTimeout(id); clearInterval(p); res() }
      }, 40)
    }), [])

  const click = useCallback(async () => {
    setCursor((c) => ({ ...c, mode: 'click' }))
    await wait(380)
    setCursor((c) => ({ ...c, mode: 'normal' }))
    await wait(120)
  }, [wait])

  // ── Move to a data-demo-target element center ──────────────────────────────
  const moveToTarget = useCallback(async (
    name: string,
    fallback: { x: number; y: number },
    ms: number,
    mode: CursorMode = 'normal',
  ) => {
    const pos = getDemoTarget(name) ?? fallback
    await move(pos.x, pos.y, ms, mode)
    await wait(200)
  }, [move, wait])

  // ── Main demo script ───────────────────────────────────────────────────────

  const runDemo = useCallback(async () => {
    if (isRunning) return
    cancelRef.current = false
    setIsRunning(true)

    try {
      // ── Phase 0: Intro (2.7s) ──────────────────────────────────────────────
      cbs.onPhaseChange('intro')
      setNodes([])
      setEdges([])
      setSimulationLog([])
      setValidationErrors([])
      clearCompletedNodes()
      setHighlightedNodeId(null)
      await wait(2700)
      if (cancelRef.current) return

      // Reset viewport to known {x:0, y:0, zoom:0.82}, wait for animation
      triggerViewportReset()
      await wait(400)

      // Get the canvas container rect NOW (after viewport settled)
      const cr = getCanvasRect()
      if (!cr) {
        toast.error('Canvas not ready — please try again')
        cbs.onPhaseChange('idle')
        return
      }

      // All cursor positions derived from RF coords + zoom + container rect
      const Z = DEMO_RF_ZOOM

      // Sidebar node targets (real DOM positions via data-demo-target)
      const sbStart    = getDemoTarget('node-start')    ?? { x: 120, y: 180 }
      const sbTask     = getDemoTarget('node-task')     ?? { x: 120, y: 225 }
      const sbApproval = getDemoTarget('node-approval') ?? { x: 120, y: 270 }
      const sbEnd      = getDemoTarget('node-end')      ?? { x: 120, y: 360 }

      // Canvas drop targets — exact RF-to-screen, center of each node
      const drop1 = nodeCenter(N1!.x, N1!.y, Z, cr)
      const drop2 = nodeCenter(N2!.x, N2!.y, Z, cr)
      const drop3 = nodeCenter(N3!.x, N3!.y, Z, cr)
      const drop4 = nodeCenter(N4!.x, N4!.y, Z, cr)

      // Handle positions for edge connections
      const h1Bot = nodeBottomHandle(N1!.x, N1!.y, Z, cr)
      const h2Top = nodeTopHandle(N2!.x, N2!.y, Z, cr)
      const h2Bot = nodeBottomHandle(N2!.x, N2!.y, Z, cr)
      const h3Top = nodeTopHandle(N3!.x, N3!.y, Z, cr)
      const h3Bot = nodeBottomHandle(N3!.x, N3!.y, Z, cr)
      const h4Top = nodeTopHandle(N4!.x, N4!.y, Z, cr)

      // Cursor appears at sidebar
      setCursor({ x: sbStart.x, y: sbStart.y - 30, duration: 0, visible: true, mode: 'normal' })
      cbs.onPhaseChange('building')

      // ── Place Start node ───────────────────────────────────────────────────
      cbs.onStepLabel('Dragging Start node to canvas...')
      await move(sbStart.x, sbStart.y, 600, 'hover')
      await wait(250)
      await move(drop1.x, drop1.y, 1050, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!])
      await wait(350)
      if (cancelRef.current) return

      // ── Place Task node ────────────────────────────────────────────────────
      cbs.onStepLabel('Adding Task node...')
      await move(sbTask.x, sbTask.y, 700, 'normal')
      await wait(200)
      await move(drop2.x, drop2.y, 1000, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!])
      await wait(320)
      if (cancelRef.current) return

      // ── Place Approval node ────────────────────────────────────────────────
      cbs.onStepLabel('Adding Approval gate...')
      await move(sbApproval.x, sbApproval.y, 700, 'normal')
      await wait(200)
      await move(drop3.x, drop3.y, 1000, 'drag')
      await click()
      setNodes([DEMO_NODES[0]!, DEMO_NODES[1]!, DEMO_NODES[2]!])
      await wait(320)
      if (cancelRef.current) return

      // ── Place End node ─────────────────────────────────────────────────────
      cbs.onStepLabel('Adding End node...')
      await move(sbEnd.x, sbEnd.y, 700, 'normal')
      await wait(200)
      await move(drop4.x, drop4.y, 1000, 'drag')
      await click()
      setNodes([...DEMO_NODES])
      triggerFitView()
      await wait(700)
      if (cancelRef.current) return

      // ── Connect edges ──────────────────────────────────────────────────────
      cbs.onPhaseChange('connecting')

      cbs.onStepLabel('Connecting Start to Task...')
      await move(h1Bot.x, h1Bot.y, 700)
      await wait(280)
      await move(h2Top.x, h2Top.y, 800, 'drag')
      await click()
      setEdges([DEMO_EDGES[0]!])
      await wait(450)
      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Task to Approval...')
      await move(h2Bot.x, h2Bot.y, 700)
      await wait(250)
      await move(h3Top.x, h3Top.y, 800, 'drag')
      await click()
      setEdges([DEMO_EDGES[0]!, DEMO_EDGES[1]!])
      await wait(450)
      if (cancelRef.current) return

      cbs.onStepLabel('Connecting Approval to End...')
      await move(h3Bot.x, h3Bot.y, 700)
      await wait(250)
      await move(h4Top.x, h4Top.y, 800, 'drag')
      await click()
      setEdges([...DEMO_EDGES])
      await wait(600)
      if (cancelRef.current) return

      // ── Edit Task title ────────────────────────────────────────────────────
      cbs.onPhaseChange('editing')
      cbs.onStepLabel('Clicking task node to edit...')
      await move(drop2.x, drop2.y, 700)
      await wait(280)
      await click()
      setSelectedNode('ld-2')
      await wait(600)

      cbs.onStepLabel('Typing task name...')
      const title = 'Review Documents'
      for (let i = 1; i <= title.length; i++) {
        if (cancelRef.current) break
        updateNodeData('ld-2', { title: title.slice(0, i) } as Parameters<typeof updateNodeData>[1])
        await wait(52)
      }
      await wait(500)
      setSelectedNode(null)
      await wait(350)
      if (cancelRef.current) return

      // ── Run simulation ─────────────────────────────────────────────────────
      cbs.onPhaseChange('simulating')
      cbs.onStepLabel('Running workflow simulation...')

      // Navigate cursor to the exact Run Workflow button
      await moveToTarget('run-workflow', { x: window.innerWidth - 160, y: 140 }, 900, 'hover')
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
          prevId = step.nodeId
        }
        const last = result.steps[result.steps.length - 1]
        if (last) addCompletedNode(last.nodeId)
        setHighlightedNodeId(null)
        setIsSimulating(false)
      }
      if (cancelRef.current) return

      // ── Success ────────────────────────────────────────────────────────────
      cbs.onPhaseChange('success')
      toast.success('Built visually. Automated intelligently.')
      setCursor((c) => ({ ...c, visible: false }))

      await wait(8000)
      if (!cancelRef.current) cbs.onPhaseChange('idle')

    } catch (err) {
      console.error('[LiveDemo]', err)
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
    triggerFitView, triggerViewportReset, cbs,
  ])

  const cancelDemo = useCallback(() => {
    cancelRef.current = true
    cbs.onPhaseChange('idle')
    setCursor((c) => ({ ...c, visible: false }))
  }, [cbs])

  return { runDemo, cancelDemo, isRunning, cursor }
}
