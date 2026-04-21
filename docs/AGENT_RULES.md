# Agent Rules
## HR Workflow Designer

> Rules every AI coding agent must follow throughout this project.

---

## Non-Negotiable Rules

1. **Always read docs/PROJECT_PROGRESS.md first** before starting any work in a session
2. **Always update docs/PROJECT_PROGRESS.md** after completing each task
3. **No em dashes** anywhere in code comments, strings, or docs
4. **No console.log left in production code** - use only during active debug, remove before commit
5. **TypeScript only** - no `any` types except where truly unavoidable, comment why
6. **Commit after each phase**, not after each file
7. **Never rewrite completed phases** without explicit instruction
8. **Do not over-engineer** - ship working code first, optimize later

---

## Code Style Rules

### General
- Functional components only, no class components
- Named exports preferred over default exports (exception: page components)
- Keep components under 150 lines. Extract sub-components when exceeded.
- No inline styles - Tailwind classes only
- Use `clsx` for conditional class names

### TypeScript
- All props must be typed with interfaces (not `type` aliases for component props)
- No `React.FC` - use `function ComponentName(props: Props)` pattern
- All event handlers typed with proper React event types
- API response types defined in `src/types/api.ts`

### State
- All persistent workflow state lives in Zustand store only
- Local state (`useState`) only for: loading flags, UI-only toggle state, form error display
- Never duplicate store data into local state

### File Naming
- Components: PascalCase.tsx
- Hooks: camelCase prefixed with `use`
- Utils: camelCase.ts
- Types: camelCase.ts
- Index files: always `index.ts`, re-export everything from the folder

---

## Commit Message Format

```
type: short description

Types: feat, fix, chore, refactor, style, docs
Examples:
  feat: add task node edit form
  fix: correct drop position calculation
  chore: update PROJECT_PROGRESS.md
  docs: add architecture notes to README
```

Max 72 chars in subject line. No period at end.

---

## What NOT to Do

- Do not install additional UI libraries (shadcn, MUI, Chakra, etc.) - Tailwind + custom components only
- Do not use `react-hook-form` or `formik` - use controlled inputs with store
- Do not use `react-query` or `swr` - use simple hooks with useState for loading
- Do not create a backend server - mock API only
- Do not add a router - single page app

---

## When to Ask the Human

Only ask for human input when:
1. A required API key or credential is needed
2. A design decision has equal tradeoffs and cannot be resolved by referencing docs/PRD.md
3. A blocking error cannot be resolved after 2 attempts

For everything else: make a reasonable decision, document it in a code comment, and move on.

---

## Asking for Manual Steps

If a task requires manual browser action (screenshot, file upload), clearly state:

```
MANUAL STEP REQUIRED:
  Action: [what to do]
  Reason: [why AI cannot do it]
  Resume: [what to tell agent after completing it]
```
