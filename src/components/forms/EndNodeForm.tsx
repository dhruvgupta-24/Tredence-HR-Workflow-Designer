import { useWorkflowStore } from '../../store'
import { Input, Toggle } from '../ui'
import { FormField } from './FormField'
import type { EndNodeData } from '../../types'

interface Props {
  nodeId: string
}

const textareaCls =
  'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none hover:border-gray-600'

export function EndNodeForm({ nodeId }: Props) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const data = useWorkflowStore(
    (s) => s.nodes.find((n) => n.id === nodeId)?.data as EndNodeData | undefined,
  )

  if (!data) return null

  return (
    <div className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={data.title}
          onChange={(v) => updateNodeData(nodeId, { title: v })}
          placeholder="e.g. Onboarding Complete"
        />
      </FormField>

      <FormField label="Completion Message">
        <textarea
          value={data.endMessage}
          onChange={(e) => updateNodeData(nodeId, { endMessage: e.target.value })}
          placeholder="Message shown when workflow finishes..."
          rows={3}
          className={textareaCls}
        />
      </FormField>

      <FormField label="Display Summary">
        <Toggle
          checked={data.showSummary}
          onChange={(v) => updateNodeData(nodeId, { showSummary: v })}
          label="Show workflow summary on completion"
        />
      </FormField>
    </div>
  )
}
