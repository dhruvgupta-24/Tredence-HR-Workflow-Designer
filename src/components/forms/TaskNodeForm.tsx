import { useWorkflowStore } from '../../store'
import { Input } from '../ui'
import { FormField } from './FormField'
import type { TaskNodeData } from '../../types'

interface Props {
  nodeId: string
}

const textareaCls =
  'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none hover:border-gray-600'

export function TaskNodeForm({ nodeId }: Props) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const data = useWorkflowStore(
    (s) => s.nodes.find((n) => n.id === nodeId)?.data as TaskNodeData | undefined,
  )

  if (!data) return null

  return (
    <div className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={data.title}
          onChange={(v) => updateNodeData(nodeId, { title: v })}
          placeholder="e.g. Complete onboarding form"
        />
      </FormField>

      <FormField label="Assignee">
        <Input
          value={data.assignee}
          onChange={(v) => updateNodeData(nodeId, { assignee: v })}
          placeholder="e.g. John Doe or HR Team"
        />
      </FormField>

      <FormField label="Due Date">
        <Input
          type="date"
          value={data.dueDate}
          onChange={(v) => updateNodeData(nodeId, { dueDate: v })}
        />
      </FormField>

      <FormField label="Description">
        <textarea
          value={data.description}
          onChange={(e) => updateNodeData(nodeId, { description: e.target.value })}
          placeholder="Additional instructions or context..."
          rows={4}
          className={textareaCls}
        />
      </FormField>
    </div>
  )
}
