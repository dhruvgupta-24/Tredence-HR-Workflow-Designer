import { useWorkflowStore } from '../../store'
import { Input, Select } from '../ui'
import { FormField } from './FormField'
import type { ApprovalNodeData } from '../../types'

interface Props {
  nodeId: string
}

const APPROVER_ROLES = [
  { value: 'Manager', label: 'Manager' },
  { value: 'HRBP', label: 'HR Business Partner' },
  { value: 'Director', label: 'Director' },
  { value: 'CEO', label: 'CEO' },
]

export function ApprovalNodeForm({ nodeId }: Props) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const data = useWorkflowStore(
    (s) => s.nodes.find((n) => n.id === nodeId)?.data as ApprovalNodeData | undefined,
  )

  if (!data) return null

  return (
    <div className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={data.title}
          onChange={(v) => updateNodeData(nodeId, { title: v })}
          placeholder="e.g. Manager Approval"
        />
      </FormField>

      <FormField label="Approver Role" required>
        <Select
          value={data.approverRole}
          onChange={(v) =>
            updateNodeData(nodeId, {
              approverRole: v as ApprovalNodeData['approverRole'],
            })
          }
          options={APPROVER_ROLES}
        />
      </FormField>

      <FormField label="Auto-Approve Threshold (%)">
        <p className="text-xs text-gray-500 mb-2">
          Set to 0 to require manual approval
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={data.autoApproveThreshold}
            onChange={(e) =>
              updateNodeData(nodeId, { autoApproveThreshold: Number(e.target.value) })
            }
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs font-mono text-gray-300 w-10 text-right">
            {data.autoApproveThreshold}%
          </span>
        </div>
      </FormField>
    </div>
  )
}
