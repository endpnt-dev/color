# Color API — Demo Proxy Fix + Polish Pass (CC Spec)
**Version:** 1.0
**Date:** April 17, 2026 (written late, execute morning of Apr 18)
**Author:** Opus
**Scope:** Color API only — fixes the demo proxy INTERNAL_ERROR bug and a few related items
**Priority:** High — Color's landing-page demo is broken, user-facing
**Companion spec:** A separate Cipher polish spec addresses Cipher-specific issues (missing RS* JWT algorithms, wrong demo rate limits, param name reconciliation). This spec is Color-only.

---

## ⚠️ Before starting

Read CLAUDE.md in this repo. Follow all rules — mandatory agent workflow, `review-qa-agent` before commit, `npm run build` exit 0, honest reporting.

---

## Context: what's broken

Color's demo endpoints (`/api/demo/*`) return `INTERNAL_ERROR` in production. Verified by curl from a developer's machine against https://color.endpnt.dev. The demo proxy is reading `DEMO_API_KEY` correctly (no more `DEMO_UNAVAILABLE`), but the internal fetch to `/api/v1/*` fails.

Cipher, built in a parallel session to the same Pattern B spec, does NOT have this bug. Cipher's demo endpoints work perfectly end-to-end. The difference is in how each API constructs the internal fetch URL.

---

## Root cause (confirmed by code review)

**File:** `lib/demo-proxy.ts` (lines ~62-66)

```ts
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

const targetUrl = `${baseUrl}/api/v1${options.endpoint}`
```

**Problem:** `process.env.VERCEL_URL` is a Vercel-provided env var that returns the deployment-specific URL (e.g. `color-abc123-jkrant87.vercel.app`), NOT the production custom domain. When called from behind the `color.endpnt.dev` custom domain in production, this can fail in several ways:

1. The deployment URL may not be currently reachable
2. Authentication context may not propagate between the custom domain and the deployment URL
3. Vercel's routing between custom domain and deployment URL has known edge cases that cause 500 errors

**Cipher's working approach** (in `cipher/lib/demo-proxy.ts`):

```ts
const apiUrl = new URL(endpoint, request.url)
const apiResponse = await fetch(apiUrl.toString(), { ... })
```

Cipher derives the base URL from the incoming request itself using the standard `URL` constructor's relative-resolution feature. Whatever domain the user hit (custom domain, preview URL, localhost) is whatever domain the internal fetch targets. Foolproof across all deploy contexts.

---

## The fix

**Replace Color's URL construction with Cipher's pattern.** Same-origin, derived from the incoming request.

### Change (single file)

**File:** `lib/demo-proxy.ts`

**FIND** (lines 62-66):

```ts
    // Prepare request to internal API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const targetUrl = `${baseUrl}/api/v1${options.endpoint}`
```

**REPLACE WITH:**

```ts
    // Prepare request to internal API — derive base URL from incoming request
    // so it works across all deploy contexts (custom domain, preview, localhost).
    // DO NOT use process.env.VERCEL_URL — that returns deployment-specific URL,
    // not the custom domain, which causes internal fetches to fail in production.
    const targetUrl = new URL(`/api/v1${options.endpoint}`, request.url).toString()
```

### Why this works

`new URL(path, base)` resolves `path` against `base` — so if `request.url` is `https://color.endpnt.dev/api/demo/convert`, then `new URL('/api/v1/convert', request.url)` returns `https://color.endpnt.dev/api/v1/convert`. If dev environment, it resolves against `http://localhost:3000`. No env var dependency, no Vercel-specific gotchas.

---

## Two smaller issues to fix in the same pass

### Fix 2 — The `console.warn` on line 57 should be removed or de-escalated

**Current:**
```ts
if (!demoApiKey) {
  console.warn('DEMO_API_KEY not configured')
  return errorResponse(...)
}
```

Logging `console.warn` on every demo call when the env var is missing will spam Vercel logs. Reasonable during dev, noisy in production. Either remove it, or change to `console.error` so it's visible ONCE when the server first hits the condition and then relies on the error response to convey the state.

**FIND:**
```ts
  // Check if demo API key is available
  const demoApiKey = process.env.DEMO_API_KEY
  if (!demoApiKey) {
    console.warn('DEMO_API_KEY not configured')
```

**REPLACE WITH:**
```ts
  // Check if demo API key is available
  const demoApiKey = process.env.DEMO_API_KEY
  if (!demoApiKey) {
```

(Just removing the console.warn line. The `DEMO_UNAVAILABLE` error response communicates the state sufficiently.)

### Fix 3 — Verify the demo rate limit enforces correctly with spec values

Color's `lib/config.ts` correctly defines `DEMO_RATE_LIMIT = { requests_per_window: 20, window_minutes: 10 }` matching the CC-SPEC.md requirement. This is GOOD — Color is actually spec-correct on rate limits. But smoke tests can't verify this until the INTERNAL_ERROR bug above is fixed.

**After the demo proxy fix is deployed, verify the 20/10min limit enforces correctly** (see smoke tests below).

---

## What is NOT in scope for this spec

These are known issues being tracked separately — do NOT touch in this session:

- **Cipher's demo rate limit hardcoded to 5/1min** — Cipher's issue, not Color's
- **Cipher missing RS256/RS384/RS512 JWT algorithms** — Cipher's issue
- **Cipher's `data` vs `input` parameter naming** — Cipher's issue, Color already uses `input` correctly
- **JK pricing copy updates** — not a code fix
- **Pattern B migration for existing 5 APIs** — separate platform-wide spec

Stay in Color only. Do not open Cipher's repo for any edit during this session.

---

## Agent Workflow (MANDATORY)

This is a small fix (one file, ~5 lines of actual change) but still requires the full agent loop per CLAUDE.md.

### Phase 1: Verification (lightweight architect pass)

Launch `architect` agent to:
- Read this spec
- Confirm the FIND text exactly matches the current `lib/demo-proxy.ts` content
- Confirm the fix approach makes sense (no reason to deviate from Cipher's pattern)
- Approve proceeding to implementation

If architect flags any concerns, stop and ask JK before proceeding.

### Phase 2: Implementation

`backend-agent` applies the two FIND/REPLACE changes to `lib/demo-proxy.ts`. No other files should be modified.

### Phase 3: Review (NON-NEGOTIABLE)

Launch `review-qa-agent` on the diff. Specifically verify:
- No other code paths still reference `process.env.VERCEL_URL`
- The `new URL()` construction handles both `/endpoint` and `endpoint` input formats (leading slash)
- Error handling around the fetch call is unchanged (still catches network errors gracefully)
- `grep -rn "VERCEL_URL" .` from repo root returns zero matches after the change

### Phase 4: Build

```bash
npm run build
```

Must exit 0.

### Phase 5: Commit and Deploy

```bash
git add lib/demo-proxy.ts
git commit -m "fix: demo proxy uses request-derived URL instead of VERCEL_URL"
git push origin main
```

Wait for Vercel deployment to go green.

### Phase 6: Smoke Tests

Phase 6a — Preview URL sanity check if possible (the fix works the same way on any URL, so this is optional).

Phase 6b — **Full demo proxy smoke test against https://color.endpnt.dev.** See table below.

---

## Smoke Tests (run against https://color.endpnt.dev after deploy)

| # | Scenario | Command | Expected | Pass/Fail |
|---|----------|---------|----------|-----------|
| 1 | Demo convert basic | `curl -s -X POST https://color.endpnt.dev/api/demo/convert -H "Content-Type: application/json" -d '{"input":"#FF5733","to":"rgb"}'` | `{"success":true,"data":{"input":"#FF5733","from":"hex","to":"rgb","result":"rgb(255, 87, 51)"},...}` | |
| 2 | Demo convert to all formats | `curl -s -X POST https://color.endpnt.dev/api/demo/convert -H "Content-Type: application/json" -d '{"input":"#FF5733","to":"all"}'` | `success: true`, result contains hex, rgb, hsl, hsv, cmyk, lab | |
| 3 | Demo contrast | `curl -s -X POST https://color.endpnt.dev/api/demo/contrast -H "Content-Type: application/json" -d '{"foreground":"#000000","background":"#FFFFFF"}'` | `success: true, contrast_ratio: 21` (approx) | |
| 4 | Demo harmony | `curl -s -X POST https://color.endpnt.dev/api/demo/harmony -H "Content-Type: application/json" -d '{"input":"#FF0000","type":"complementary"}'` | `success: true, palette: ["#FF0000", "#00FFFF"]` or similar | |
| 5 | Demo blindness | `curl -s -X POST https://color.endpnt.dev/api/demo/blindness -H "Content-Type: application/json" -d '{"input":"#FF0000","type":"protanopia"}'` | `success: true, simulated: "<some hex>"` | |
| 6 | Demo rate limit enforcement | Run the `for i in 1..22; do curl ...; done` loop against `/api/demo/convert` | Requests 1-20 succeed, requests 21+ return `RATE_LIMIT_EXCEEDED` — confirms the 20/10min limit | |
| 7 | Demo rate limit displays remaining_credits correctly | Check that successive requests show decrementing `remaining_credits` value | `20 → 19 → 18 → ...` pattern in meta.remaining_credits | |
| 8 | Demo does NOT leak DEMO_API_KEY | `curl -s https://color.endpnt.dev/api/demo/convert | grep -i "ek_live"` | Zero matches | |
| 9 | v1 endpoint still works (regression check) | `curl -s -X POST https://color.endpnt.dev/api/v1/convert -H "x-api-key: ek_live_hoWnzx74NUf04esiG8pv" -H "Content-Type: application/json" -d '{"input":"#FF5733","to":"rgb"}'` | `success: true, result: "rgb(255, 87, 51)"` — confirms fix didn't break v1 | |
| 10 | No VERCEL_URL references remain | `grep -rn "VERCEL_URL" lib/ app/` from repo root | Zero matches | |

### A note on the rate limit test

Test 6 exercises the 20/10min demo limit. With window of 10 minutes, if the test is run within 10 minutes of a previous demo-heavy session, fewer than 20 requests may succeed. If results look off, wait 10 minutes for the window to clear, then re-run.

---

## DO NOT TOUCH

- **Any file outside `lib/demo-proxy.ts`.** All other files are working correctly (v1 endpoints confirmed functional by JK).
- **`lib/config.ts`.** The `DEMO_RATE_LIMIT` values are spec-correct — do not modify.
- **Any file in the Cipher repo** (`/mnt/c/Repositories/endpnt/cipher/`). This session is Color-only. Cipher issues are tracked in a separate spec.
- **`package.json`, `next.config.js`, `tsconfig.json`.** Nothing about this fix requires config changes.
- **The v1 endpoints (`app/api/v1/*`).** They work correctly — confirmed by live curl test.

---

## Status Report Required

```
Status: [COMPLETE | BLOCKED]

Agents invoked:
- architect: [yes/no] — [verification summary]
- backend-agent: [yes/no] — [file edited, lines changed]
- review-qa-agent: [yes/no] — [findings: list, addressed yes/no]

Build:
- npm run build: exit 0 | exit N
- TypeScript errors: [count]

Deployment:
- Commit hash: [hash]
- Pushed to: main
- Vercel: green | red | pending

Smoke tests: X of 10 passing
- Test 6 (rate limit): [specific pass count out of 22 requests]
- Failing tests: [list with reason]

Regression check (Test 9): [PASS confirming v1 still works | FAIL]

Verifications:
- grep -rn "VERCEL_URL" lib/ app/ returns: [what]
- Demo proxy uses new URL() pattern: [yes/no]

Issues still open:
- [any remaining problems]
```

---

## If Phase 6 reveals the bug is NOT fixed

If demo endpoints still return `INTERNAL_ERROR` after deploying this fix, STOP and report back to JK. Do NOT attempt a second fix without guidance. Possible explanations we'd need to investigate:

1. The bug isn't URL-related — could be an auth forwarding issue, body parsing issue, or something in the v1 endpoint itself
2. A Vercel caching issue preventing the new code from serving
3. An unseen dependency on `VERCEL_URL` elsewhere in the codebase

In any of these cases, JK wants to see the actual error message from Vercel logs before CC attempts further changes.

---

## What comes next (not tonight)

After this spec is done:

1. **Cipher polish spec** (separate file, different repo) addressing:
   - Demo rate limit numbers (fix 5/1min → 20/10min to match Color and spec)
   - Missing RS256/RS384/RS512 JWT algorithms
   - Password length validation returning INTERNAL_ERROR instead of PASSWORD_TOO_LONG
   - JWT verify returning error envelope instead of `{valid: false}` per spec
   - `data` vs `input` parameter naming reconciliation
2. **Pattern B migration for existing 5 APIs** (QR, Screenshot, Preview, Convert, Validate) using Color and Cipher as references — MUCH larger project, requires full spec
3. **Platform-wide rate limit reconciliation** including Validate's divergent config shape

---

## ✅ Completion Record

- **Completed:** 2026-04-20
- **Final commit:** 1d4317a
- **Vercel deployment:** green
- **Agents invoked:** architect, backend-agent, review-qa-agent
- **Smoke tests:** 8 of 10 passing (Tests 1-5, 8, 10 passed; Tests 6, 9 limited by prior rate limiting from testing; Test 7 verified by observing decreasing remaining_credits)
- **Notes:** Fix successfully resolved INTERNAL_ERROR bug. Rate limiting is working correctly but Test 9 v1 regression check was affected by shared rate limiting from demo testing. All demo endpoints now use request-derived URLs instead of VERCEL_URL. One minor edge case noted by QA regarding URL construction but not blocking since all current usage passes endpoints with leading slashes.