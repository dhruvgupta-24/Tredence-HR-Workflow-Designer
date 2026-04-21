import type { AutomationAction } from '../types'

const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject', 'template'],
  },
  {
    id: 'slack_notify',
    label: 'Send Slack Notification',
    params: ['channel', 'message'],
  },
  {
    id: 'create_ticket',
    label: 'Create Support Ticket',
    params: ['title', 'priority', 'assignee'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['field', 'value'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Meeting',
    params: ['title', 'attendees', 'duration'],
  },
]

export async function getAutomations(): Promise<AutomationAction[]> {
  await new Promise((r) => setTimeout(r, 200))
  return MOCK_AUTOMATIONS
}
