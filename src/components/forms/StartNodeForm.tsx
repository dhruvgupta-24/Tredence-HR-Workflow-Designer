import { useWorkflowStore } from '../../store'
import { Input } from '../ui'
import { FormField } from './FormField'
import { KeyValueEditor } from './KeyValueEditor'
import type { StartNodeData } from '../../types'

interface Props {
  nodeId: string
}

export function StartNodeForm({ nodeId }: Props) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const data = useWorkflowStore(
    (s) => s.nodes.find((n) => n.id === nodeId)?.data as StartNodeData | undefined,
  )

  if (!data) return null

  return (
    <div className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={data.title}
          onChange={(v) => updateNodeData(nodeId, { title: v })}
          placeholder="e.g. Onboarding Started"
        />
      </FormField>

      <FormField label="Metadata Fields">
        <p className="text-xs text-gray-500 mb-2">
          Capture initial data when the workflow starts
        </p>
        <KeyValueEditor
          pairs={data.metadata}
          onChange={(metadata) => updateNodeData(nodeId, { metadata })}
        />
      </FormField>
    </div>
  )
}
