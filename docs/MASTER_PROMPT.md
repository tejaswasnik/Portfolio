# Master prompt

Paste everything inside the block into your AI IDE (Claude Code, Cursor, Windsurf…) from the repo root. Before you do:
1. Put `README.md`, `CLAUDE.md`, `.env.example` at the repo root and the rest in `docs/` (`PRD.md`, `design.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `PROMPTS.md`, `figma-map.md`).
2. Connect the Figma MCP so the agent can read the design file.
3. Have your credentials ready (MongoDB URI, ImageKit keys, Google OAuth values). The agent will use placeholders until you fill `.env.local`.

```
You are the sole engineer building my portfolio website end to end. Work autonomously until it is finished. Do not stop to ask me unless something is truly blocked (see "When to stop").

## 1. Read everything first
Read, in this order, before writing any code:
CLAUDE.md → README.md → docs/PRD.md → docs/design.md → docs/ARCHITECTURE.md → docs/figma-map.md → docs/ROADMAP.md → docs/PROMPTS.md.
Rules of precedence: Figma frames beat docs/design.md; the PRD beats Figma on scope (no Notes link, logo "TW."); CLAUDE.md conventions always apply. Stack is fixed: npm, Next.js (App Router, plain JavaScript only: .js/.jsx, no TypeScript), Tailwind, MongoDB (official driver), JWT auth with jose, ImageKit, Nodemailer with Google OAuth2, Zod. Do not swap or add major libraries without a written reason in docs/DECISIONS.md.

## 2. Plan
Create PROGRESS.md at the repo root with one checkbox per prompt in docs/PROMPTS.md (steps 0 to 13), each with: status, date, commit hash, verification result, and any deviations or open issues. Keep it updated after every step. This file is how I will see what happened.

## 3. Execute docs/PROMPTS.md one step at a time, in order
For each step N:
1. Re-read the step's prompt, the relevant PRD sections, and the Figma frames it names (use the Figma MCP: get_design_context, get_screenshot, get_variable_defs on file key KxTn1qYG7kzoGVYjbQM5Vh; node IDs are in docs/figma-map.md). Do not guess the UI.
2. Implement the step exactly as written. Write tests for logic (validation, visibility rules, auth, rate limiting, hashing, aggregations, email-failure path).
3. Verify. All of these must pass before moving on:
   - npm run lint && npm test && npm run build
   - For UI steps: run the dev server, screenshot the page at 1440, 1280, 768 and 375 in dark and light, compare with the Figma screenshot, and fix every visible difference (spacing, type, colour, borders, radius). Use tokens only, never hard-coded hex.
   - Walk the feature manually as a user would: click through, submit forms with good and bad input, check keyboard use.
4. Fix what fails. Try up to 3 distinct fixes for the same failure; if still failing, record it in PROGRESS.md under "Blocked" and continue with any step that does not depend on it.
5. Commit with a clear message (feat/fix/test/chore: …), update PROGRESS.md, then start the next step. Do not batch several steps into one commit.

Step 8 (admin content screens): build the screens in the order listed, committing after each.

## 4. Missing design or unclear spec
- If a screen or state has no Figma frame (lightbox, empty, loading, error, confirmation dialogs), build it from existing tokens and components, keep it visually consistent, and list it in PROGRESS.md under "Designed by me".
- If the PRD is ambiguous, pick the simplest option that matches its intent, record it in docs/DECISIONS.md (decision, alternatives, reason), and continue.
- Sample content in Figma (names, messages, stats) is placeholder. Real data comes from the database; seed sensible defaults.

## 5. Secrets and external services
- Never commit secrets. Read them from .env.local; keep .env.example current.
- If a credential is missing, build against the interface, mock the service in tests, and make the feature degrade gracefully (e.g. contact message saved with emailFailed, GitHub heatmap hidden, ImageKit uploads disabled with a clear admin notice). Add the missing item to "Needs from you" in PROGRESS.md and keep going.
- Never use real third-party services in automated tests.

## 6. Quality bar (applies to every step)
- Server components by default; client components only when needed.
- Every input validated with the shared Zod schema on the server. Every /admin route and action protected by middleware AND requireAdmin().
- Revalidate affected tags/paths after every admin mutation.
- Accessibility: keyboard navigation, focus states, labels, alt text, AA contrast in both themes, prefers-reduced-motion.
- No console errors or warnings in the browser or the build.
- Small, single-purpose files; no dead code; no TODO left without an entry in PROGRESS.md.

## 7. Final phase (after step 13)
1. Run the full verification once more from a clean install: rm -rf node_modules .next && npm ci && npm run lint && npm test && npm run build.
2. End-to-end pass against a local database: seed → admin login → create/edit/publish a project → see it on the public site → submit the contact form → see the message in the inbox → check the dashboard counts → toggle a section → toggle maintenance mode → export JSON.
3. Run Lighthouse on /, /projects and a project page (target 90+ in all categories) and fix what is below target.
4. Re-compare every page with its Figma frame and list any remaining differences.
5. Make sure README.md is accurate: setup, env vars (with where to get each), Gmail OAuth refresh-token steps, seeding the admin, deployment steps.
6. Tag the release (v1.0.0).

## 8. Deliverable
When done, reply with a short report: what was built, test and Lighthouse results, a list of deviations and "Designed by me" items, everything in "Needs from you" (credentials, decisions), and the exact commands to run the project and deploy it. Everything else stays in PROGRESS.md and docs/DECISIONS.md.

## When to stop and ask me
Only if (a) a step cannot proceed without a credential or decision and no dependent-free work remains, (b) an action would be destructive or irreversible (deleting data, force-pushing, changing git history), or (c) the docs contradict each other in a way that changes scope. Otherwise decide, record it, and keep going.

Begin now with step 0.
```

## Tips for running it
- **Context limits:** if the IDE loses context mid-way, start a new session and paste only: "Read CLAUDE.md and PROGRESS.md, then continue from the first unchecked step using docs/PROMPTS.md and the same rules as docs/MASTER_PROMPT.md."
- **Long runs:** commits after every step mean you can stop and resume anywhere, or `git revert` a bad step.
- **Cost control:** run steps 0 to 2 yourself first to confirm the setup looks right, then use the master prompt for the rest.
