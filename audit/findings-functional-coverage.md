# Functional E2E and PRD/Figma coverage findings (areas A, B)

**Note on environment state:** during this fork's testing, the disposable admin's password was changed from the originally seeded `AuditTest1234!` to `AuditTest5678!` (to test session invalidation on password change — see FUNC-ADM-01). The shared cookie jar at `scratchpad/cookies.txt` was refreshed accordingly. Any further live testing in this audit against `audit@test.local` should use the new password.

## A. PRD / Figma route coverage

| Requirement | Status | Evidence |
|---|---|---|
| Navbar `TW.`/Home/Projects/theme toggle, no Notes | Done | Confirmed in rendered HTML of `/`, `/projects`, `/projects/[slug]` |
| Side index + scroll-spy | Done | 4 anchor links found; active-state link appears after scroll |
| SEO: sitemap/robots/per-project meta | Done | `/sitemap.xml`, `/robots.txt` well-formed; project OG/title/description tags confirmed |
| Home sections (Profile/About/Contact/Heatmap/Projects/Stack/Let's talk/Footer) | Done | All render on `/` |
| `/projects` filters | Done | Garbage tag/status params don't crash |
| `/projects/[slug]` markdown + prev/next + SEO | Done | See FUNC-PUB-03 |
| Contact form (honeypot + rate limit + save-first) | Done | See FUNC-PUB-04/05/06 |
| Auth (login, lockout copy, change password/email) | Done | Generic error, tokenVersion session invalidation confirmed |
| Skills CRUD incl. multi-library icon picker | Done | Simple Icons/Lucide/Remix Icon all verified live |
| Projects CRUD incl. unique slug | Done | Duplicate slug rejected with clear message |
| Maintenance mode (Phase 2) | Done, confirmed live | Toggled both directions, public shows maintenance page while `/admin` stays reachable |
| Drag-to-reorder projects (Phase 2) | Done | Drag handle + `MoveButtons` present |
| Media library, banner, profile/resume, messages sub-actions, click-tracking, JSON export, section-toggle | **Not verified by this fork** | Time-boxed out — not contradicted, just not reached (click-tracking/data layer separately verified by the security/privacy fork; see `audit/findings-security-privacy-data.md`) |

## B. Functional E2E

All findings below are Pass/Confirmed, each reproduced with live evidence (curl output, RSC payload inspection, or Playwright screenshots) — no P0/P1/P2 defects were found in the areas this fork tested.

### FUNC-PUB-03 — Markdown renders correctly and XSS payload is safely escaped
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Location:** `src/components/public/MarkdownContent.jsx`, project `longDescription` field
- **Evidence:** Created a project with markdown (`**bold**`, list, code block) plus an XSS payload (`<script>` + `<img onerror>`) as `longDescription`. Markdown rendered correctly; the script/onerror payload was HTML-entity-escaped in the server-rendered output — confirmed both via raw RSC payload inspection and via Playwright (`window.__auditXSS` never set).
- **Expected vs actual:** Matches expected safe behavior exactly.
- **Impact:** None — working as intended.
- **Recommended fix:** None needed.

### FUNC-PUB-04/05/06 — Contact form validation, honeypot, rate limit, and emailFailed save-first all correct
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Empty/invalid-email validation returns clean Zod field errors; honeypot submission returns a fake `ok:true` but is silently dropped (not saved) while still consuming rate-limit budget; exactly 3 requests/hour succeed before a clear block message; a real submission is saved and visible in `/admin/messages` despite no real email backend in this sandbox.
- **Expected vs actual:** Matches PRD exactly.
- **Impact:** None — working as intended.
- **Recommended fix:** None needed.

### FUNC-PUB-07 — 404 and sitemap/robots correctness
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** 404 for unknown slugs; well-formed `/sitemap.xml` (published only) and `/robots.txt`.
- **Recommended fix:** None needed.

### FUNC-ADM-01 — Login error handling and tokenVersion session invalidation
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Wrong password → generic error (no email-enumeration leak); correct login redirects to `/admin`; changing the password in one session invalidates a second ("stale tab") session's cookie (tokenVersion bump), and re-login with the new password works.
- **Recommended fix:** None needed.

### FUNC-ADM-02 — Multi-library icon picker persists real icons across all three libraries
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Created three skills using Simple Icons (`nextdotjs`), Lucide (`house`→`birdhouse`), and Remix Icon (`star`→`mail-star-fill`) respectively — all three persisted with correct `iconLibrary`/`iconSlug` and render real brand/outline icons, not letter-tile fallbacks.
- **Recommended fix:** None needed.

### FUNC-ADM-04 — Maintenance mode toggles correctly in both directions
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Maintenance mode toggled on → public `/` shows maintenance page while `/admin` stays reachable (200) → toggled back off → confirmed restored.
- **Recommended fix:** None needed.

### FUNC-VIS-01 — Visibility rules (draft/published/featured) match PRD exactly
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Draft project 404s everywhere public; published-but-not-featured appears on `/projects` + sitemap but not on `/`; matches PRD exactly.
- **Recommended fix:** None needed.

### FUNC-DATA-01 — Duplicate slug rejected client-side with a clear message
- **Severity:** P3 (Pass)
- **Confidence:** Confirmed
- **Evidence:** Creating a project with a slug that collides with an existing one ("workspace") is rejected client-side with "That slug is already in use." — no duplicate created. (Also independently confirmed at the DB level by the security/privacy fork — see DATA section of `audit/findings-security-privacy-data.md`.)
- **Recommended fix:** None needed.

## Gaps — not findings, just not reached in this pass
Banner upload/replace/remove, profile/resume editor, messages sub-actions (read/unread/archive/delete/reply, and the `emailFailed` flag's actual DB value), Settings JSON export download, media library, section-visibility toggle specifically (the structurally-identical maintenance toggle was verified), screenshot gallery/lightbox, theme no-flash-on-reload, and long/unicode/empty-list data edge cases. These are time-boxed omissions, not negative findings — mark as "Not verified" in the final report rather than Pass or Fail.

## Summary and scores
No P0 or P1 findings were produced by this fork's testing — everything exercised passed. DB left in an additive-only state (no re-seed was needed).

- **A (Spec coverage): 7/10** — every reached requirement is fully implemented and matches the PRD/Figma; score is capped by the sizable list of Phase 2/admin areas this fork didn't reach in its time-boxed pass (see Gaps above), not by any defect.
- **B (Functional E2E): 8/10** — zero defects found in everything exercised (public site, auth, skills/icon picker, maintenance mode, visibility rules, slug uniqueness); docked only for the same coverage gaps.
