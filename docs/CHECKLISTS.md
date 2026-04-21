# QA Checklist + Polish Checklist
## HR Workflow Designer

---

## QA Checklist

Run through this before marking any phase complete.

### Phase 1 - Canvas
- [ ] Can drag Start node from sidebar to canvas
- [ ] Can drag all 5 node types to canvas
- [ ] Node appears at drop position (not at 0,0)
- [ ] Can draw edge between two nodes
- [ ] Can delete a node (backspace/delete key)
- [ ] Can delete an edge
- [ ] Canvas pans with mouse drag on background
- [ ] Canvas zooms with scroll wheel

### Phase 2 - Node Components
- [ ] Each node type shows its correct color badge
- [ ] Node title renders from data
- [ ] Handles render correctly (top/bottom or per-node logic)
- [ ] Selected node shows highlighted border
- [ ] No TypeScript errors in node files

### Phase 3 - Edit Forms
- [ ] Clicking node opens drawer
- [ ] Correct form shown per node type
- [ ] Editing title field updates node preview live
- [ ] KeyValueEditor: can add a row, edit key+value, remove row
- [ ] ApprovalNodeForm: dropdown shows 4 role options
- [ ] AutomatedNodeForm: action dropdown populated (after Phase 4)
- [ ] Changing action clears previous param fields and shows new ones
- [ ] Close button dismisses drawer

### Phase 4 - Mock API
- [ ] getAutomations() returns 4 actions with correct params
- [ ] AutomatedNodeForm dropdown shows all action labels
- [ ] simulateWorkflow() returns steps in correct order
- [ ] Steps reflect actual node data (not just placeholders)

### Phase 5 - Sandbox
- [ ] Run Workflow button visible
- [ ] Button shows spinner during simulation
- [ ] Execution log renders after simulation
- [ ] Each step shows step number + label + color dot
- [ ] Error shown if simulation fails

### Phase 6 - Validation
- [ ] Empty canvas: "must have a Start node" error
- [ ] No end node: error shown
- [ ] Orphan node: error names the node
- [ ] Edge from Start to End only: passes validation
- [ ] Cycle detected: error shown
- [ ] Errors shown before simulation runs

---

## Final Polish Checklist

Run before final commit.

### Visual Quality
- [ ] Consistent 8px grid spacing throughout
- [ ] No layout shifts or overflow issues
- [ ] Empty canvas state message visible
- [ ] Node hover state shows delete button or highlight
- [ ] Sidebar items look clickable/draggable (cursor: grab)
- [ ] Drawer opens/closes with smooth transition
- [ ] Execution log steps animate in

### Code Quality
- [ ] `npm run build` completes with no errors
- [ ] `tsc --noEmit` passes (no TypeScript errors)
- [ ] No unused imports
- [ ] No commented-out dead code
- [ ] No `console.log` in production paths

### README
- [ ] Setup steps are accurate (tested from scratch)
- [ ] Completed features list is accurate
- [ ] Tech stack table is complete
- [ ] Design decisions section is filled
- [ ] "What I would add" section reflects actual thought

### Git
- [ ] Clean commit history (no "wip" or "asdf" commits)
- [ ] Final commit message is `chore: submission ready`
- [ ] .gitignore includes node_modules and dist
- [ ] No secrets or .env files committed

### Submission
- [ ] GitHub repo is public (or shared with recruiter)
- [ ] README renders correctly on GitHub
- [ ] `npm install && npm run dev` works on a clean clone
