# Product Requirements Document
## HR Workflow Designer

---

## Problem Statement

HR teams manage complex multi-step processes (onboarding, leave approval, exit) through emails and spreadsheets. This tool gives them a visual drag-and-drop interface to define, document, and simulate those workflows.

---

## Target User

HR Admin / HR Operations team member at a mid-to-large company.

---

## Core Use Cases

| # | Use Case |
|---|---|
| UC1 | Design a new onboarding workflow from scratch |
| UC2 | Add approval checkpoints for leave requests |
| UC3 | Automate email and document steps |
| UC4 | Validate workflow before publishing |
| UC5 | Simulate workflow execution and view step logs |

---

## Features

### P0 - Must Ship

| Feature | Description |
|---|---|
| Canvas | Drag-drop node area with pan/zoom |
| Sidebar Toolbox | All 5 node types, draggable onto canvas |
| Node Connections | Draw edges between nodes |
| Node Edit Panel | Click node to open form, edit fields, save |
| Start Node | Title + key-value metadata |
| Task Node | Title, description, assignee, due date, custom fields |
| Approval Node | Title, approver role, auto-approve threshold |
| Automated Step Node | Title, action dropdown (from API), dynamic param fields |
| End Node | End message, summary flag toggle |
| Mock API | GET /automations, POST /simulate |
| Sandbox Panel | Run button, serialize graph, show execution log |
| Validation | Detect missing start/end, orphan nodes, missing connections |

### P1 - Ship If Time Allows

| Feature | Description |
|---|---|
| Export JSON | Download workflow as JSON file |
| Import JSON | Load workflow from JSON file |
| Undo / Redo | Ctrl+Z / Ctrl+Y |
| Minimap | React Flow minimap component |
| Zoom controls | Zoom in/out/reset buttons |

### P2 - Mention In README Only

- Workflow templates
- Version history per node
- Auto-layout algorithm
- Validation badges on nodes

---

## Non-Goals

- Real backend / database
- User authentication
- Real email or document generation
- Mobile responsiveness (desktop only)

---

## Success Criteria

1. Any HR admin could understand the UI without instructions
2. Can build a 5-node onboarding workflow in under 2 minutes
3. Workflow simulation returns readable execution log
4. Code passes a senior engineer code review
