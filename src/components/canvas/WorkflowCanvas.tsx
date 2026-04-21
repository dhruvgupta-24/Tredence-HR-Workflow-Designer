import { useCallback } from 'react'
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

export function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)

  const reactFlowInstance = useReactFlow()
  const onDrop = useDropHandler(reactFlowInstance)

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      setNodes(applyNodeChanges(changes, nodes))
    },
    [nodes, setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(rfAddEdge(connection, edges))
    },
    [edges, setEdges],
  )

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        <Background variant={BackgroundVariant.Dots} gap={16} color="#374151" />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor="#4b5563"
          maskColor="rgba(3, 7, 18, 0.7)"
          style={{ background: '#111827' }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-10 select-none">⬡</div>
            <p className="text-gray-500 text-sm font-medium">
              Drag nodes from the left panel to get started
            </p>
            <p className="text-gray-600 text-xs mt-1.5">
              Connect nodes by dragging from one handle to another
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
