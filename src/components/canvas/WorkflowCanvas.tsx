import { useCallback, useEffect, useRef } from 'react'
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
import { nodeTypes } from '../nodes'
import { onDragOver, useDropHandler } from '../../hooks/useDragDrop'
import type { WorkflowNode } from '../../types'

const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2, stroke: '#6366f1' },
}

const snapGrid: [number, number] = [16, 16]

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
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const fitViewCounter = useWorkflowStore((s) => s.fitViewCounter)

  const { fitView } = useReactFlow()
  const reactFlowInstance = useReactFlow()
  const onDrop = useDropHandler(reactFlowInstance)
  const didInitialFitRef = useRef(false)

  // Initial fit: fire once when nodes first become available
  useEffect(() => {
    if (didInitialFitRef.current || nodes.length === 0) return
    didInitialFitRef.current = true
    const t = setTimeout(() => void fitView({ padding: 0.15, duration: 350 }), 80)
    return () => clearTimeout(t)
  }, [nodes.length, fitView])

  // Subsequent fits triggered by store counter (template load, import, seed)
  useEffect(() => {
    if (fitViewCounter === 0) return
    const t = setTimeout(() => void fitView({ padding: 0.15, duration: 400 }), 80)
    return () => clearTimeout(t)
  }, [fitViewCounter, fitView])

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
      saveSnapshot()
      setEdges(rfAddEdge(connection, edges))
    },
    [edges, setEdges, saveSnapshot],
  )

  const onNodeDragStart = useCallback(() => {
    saveSnapshot()
  }, [saveSnapshot])

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapGrid={snapGrid}
        snapToGrid
        colorMode="dark"
        className="bg-gray-900"
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1f2937" />
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
            <div className="text-5xl mb-4 opacity-[0.07] select-none">⬡</div>
            <p className="text-sm font-medium text-gray-500">
              Drag nodes from the left to get started
            </p>
            <p className="text-xs text-gray-700 mt-1.5">
              or load a template from the sidebar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
