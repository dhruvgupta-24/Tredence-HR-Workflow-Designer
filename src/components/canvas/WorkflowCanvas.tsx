import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  BackgroundVariant,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Edge,
} from '@xyflow/react'
import { useWorkflowStore } from '../../store'
import { useThemeStore } from '../../store/themeStore'
import { nodeTypes } from '../nodes'
import { onDragOver, useDropHandler } from '../../hooks/useDragDrop'
import type { WorkflowNode } from '../../types'
import { toast } from '../../store/toastStore'

const DEFAULT_EDGE_STYLE = { strokeWidth: 2, stroke: '#6366f1' }
const ACTIVE_EDGE_STYLE  = { strokeWidth: 2.5, stroke: '#818cf8' }
const DONE_EDGE_STYLE    = { strokeWidth: 2, stroke: '#22c55e' }

const minimapNodeColor = (node: { type?: string }) => {
  switch (node.type) {
    case 'start':     return '#22c55e'
    case 'task':      return '#3b82f6'
    case 'approval':  return '#f97316'
    case 'automated': return '#a855f7'
    case 'end':       return '#ef4444'
    default:          return '#4b5563'
  }
}

export function WorkflowCanvas() {
  const theme              = useThemeStore((s) => s.theme)
  const nodes              = useWorkflowStore((s) => s.nodes)
  const edges              = useWorkflowStore((s) => s.edges)
  const highlightedNodeId  = useWorkflowStore((s) => s.highlightedNodeId)
  const completedNodeIds   = useWorkflowStore((s) => s.completedNodeIds)
  const setNodes           = useWorkflowStore((s) => s.setNodes)
  const setEdges           = useWorkflowStore((s) => s.setEdges)
  const setSelectedNode    = useWorkflowStore((s) => s.setSelectedNode)
  const saveSnapshot       = useWorkflowStore((s) => s.saveSnapshot)
  const fitViewCounter        = useWorkflowStore((s) => s.fitViewCounter)
  const viewportResetCount    = useWorkflowStore((s) => s.viewportResetCount)

  const { fitView, setViewport } = useReactFlow()
  const reactFlowInstance        = useReactFlow()
  const onDrop             = useDropHandler(reactFlowInstance)
  const didInitialFitRef   = useRef(false)

  // Initial fit
  useEffect(() => {
    if (didInitialFitRef.current || nodes.length === 0) return
    didInitialFitRef.current = true
    const t = setTimeout(() => void fitView({ padding: 0.15, duration: 350 }), 80)
    return () => clearTimeout(t)
  }, [nodes.length, fitView])

  // Counter-triggered fit (template / import / seed)
  useEffect(() => {
    if (fitViewCounter === 0) return
    const t = setTimeout(() => void fitView({ padding: 0.15, duration: 400 }), 80)
    return () => clearTimeout(t)
  }, [fitViewCounter, fitView])

  // Viewport reset to known state for Live Demo cursor math
  useEffect(() => {
    if (viewportResetCount === 0) return
    const t = setTimeout(() => void setViewport({ x: 0, y: 0, zoom: 0.82 }, { duration: 300 }), 60)
    return () => clearTimeout(t)
  }, [viewportResetCount, setViewport])

  // Compute per-edge styles based on simulation state
  const styledEdges = useMemo(() =>
    edges.map((e) => {
      const srcActive    = e.source === highlightedNodeId
      const srcCompleted = completedNodeIds.includes(e.source)
      return {
        ...e,
        className: srcActive ? 'edge-active' : srcCompleted ? 'edge-completed' : '',
        style: srcActive ? ACTIVE_EDGE_STYLE : srcCompleted ? DONE_EDGE_STYLE : DEFAULT_EDGE_STYLE,
        animated: srcActive ? true : e.animated,
      }
    }),
    [edges, highlightedNodeId, completedNodeIds],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      if (changes.some((c) => c.type === 'remove')) saveSnapshot()
      setNodes(applyNodeChanges(changes, nodes))
    },
    [nodes, setNodes, saveSnapshot],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      if (changes.some((c) => c.type === 'remove')) saveSnapshot()
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges, saveSnapshot],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection
      if (!source || !target) return

      if (source === target) {
        toast.error('A node cannot connect to itself.')
        return
      }

      if (edges.some((e) => e.source === source && e.target === target)) {
        toast.error('This connection already exists.')
        return
      }

      const sourceNode = nodes.find((n) => n.id === source)
      if (sourceNode?.type === 'end') {
        toast.error('End node cannot have outgoing connections.')
        return
      }

      const targetNode = nodes.find((n) => n.id === target)
      if (targetNode?.type === 'start') {
        toast.error('Start node cannot have incoming connections.')
        return
      }

      saveSnapshot()
      setEdges(rfAddEdge(connection, edges))
    },
    [edges, nodes, setEdges, saveSnapshot],
  )

  const onNodeDragStart = useCallback(() => saveSnapshot(), [saveSnapshot])

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        snapGrid={[16, 16]}
        snapToGrid
        colorMode={theme}
        className="bg-gray-900"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1C2238"
        />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(3, 7, 18, 0.55)"
          style={{
            background: '#0f172a',
            border: '1px solid rgba(31, 41, 55, 0.7)',
            borderRadius: '10px',
            width: 148,
            height: 92,
            opacity: 0.85,
          }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-[0.06] select-none">⬡</div>
            <p className="text-sm font-medium text-gray-500">Drag nodes from the left to get started</p>
            <p className="text-xs text-gray-700 mt-1.5">or load a template · or press <kbd className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-500">Ctrl+K</kbd></p>
          </div>
        </div>
      )}
    </div>
  )
}
