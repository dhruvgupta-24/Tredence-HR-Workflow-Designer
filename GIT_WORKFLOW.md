# Git Workflow
## HR Workflow Designer

---

## Branch Strategy

Single branch: `main`

This is a solo internship assignment. No PR workflow needed. All commits go directly to main.

---

## Commit Schedule

| When | Commit |
|---|---|
| After Phase 0 | `chore: initial project scaffold` |
| After Phase 1 | `feat: canvas and sidebar shell` |
| After Phase 2 | `feat: custom node components` |
| After Phase 3 | `feat: node edit forms and drawer` |
| After Phase 4 | `feat: mock API layer` |
| After Phase 5 | `feat: sandbox panel and workflow simulation` |
| After Phase 6 | `feat: graph validation` |
| After Phase 7 (each) | `feat: export/import JSON` / `feat: undo redo` |
| After Phase 8 | `chore: submission ready` |
| Doc updates | `chore: update progress docs` |

---

## Commit Message Rules

- Format: `type: description`
- Subject line max 72 characters
- No period at end
- Present tense ("add" not "added")
- No em dashes

Valid types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`

---

## Commands

```bash
# Init repo (Phase 0)
git init
git add .
git commit -m "chore: initial project scaffold"

# Regular commit
git add .
git commit -m "feat: canvas and sidebar shell"

# Push to GitHub (for submission)
git remote add origin <repo-url>
git push -u origin main
```

---

## GitHub Submission Checklist

- [ ] All phases committed
- [ ] README.md is accurate and complete
- [ ] No .env files committed
- [ ] No node_modules committed (.gitignore correct)
- [ ] `npm run build` passes
- [ ] Repo is public or shared with Tredence recruiter
