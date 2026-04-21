import { useWorkflowStore } from '../../store'
import { Input, Select } from '../ui'
import { FormField } from './FormField'
import type { AutomatedNodeData, AutomationAction } from '../../types'

interface Props {
  nodeId: string
}

export function AutomatedNodeForm({ nodeId }: Props) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const automations = useWorkflowStore((s) => s.automations)
  const data = useWorkflowStore(
    (s) => s.nodes.find((n) => n.id === nodeId)?.data as AutomatedNodeData | undefined,
  )

  if (!data) return null

  const selectedAction = automations.find((a) => a.id === data.actionId)

  const actionOptions = [
    { value: '', label: automations.length === 0 ? 'Loading actions...' : 'Select an action' },
    ...automations.map((a) => ({ value: a.id, label: a.label })),
  ]

  const handleActionChange = (actionId: string) => {
    const action: AutomationAction | undefined = automations.find((a) => a.id === actionId)
    updateNodeData(nodeId, {
      actionId,
      actionParams: action ? Object.fromEntries(action.params.map((p) => [p, ''])) : {},
    })
  }

  return (
    <div className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={data.title}
          onChange={(v) => updateNodeData(nodeId, { title: v })}
          placeholder="e.g. Send Welcome Email"
        />
      </FormField>

      <FormField label="Action" required>
        <Select
          value={data.actionId}
          onChange={handleActionChange}
          options={actionOptions}
        />
      </FormField>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            Action Parameters
          </p>
          {selectedAction.params.map((param) => (
            <FormField key={param} label={param}>
              <Input
                value={data.actionParams[param] ?? ''}
                onChange={(v) =>
                  updateNodeData(nodeId, {
                    actionParams: { ...data.actionParams, [param]: v },
                  })
                }
                placeholder={`Enter ${param}`}
              />
            </FormField>
          ))}
        </div>
      )}
    </div>
  )
}
