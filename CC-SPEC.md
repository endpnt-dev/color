# Color API — CC Spec (Greenfield Build)
**Version:** 1.0
**Date:** April 17, 2026
**Author:** Opus (planning only — CC executes via agents, CC itself does not write code)
**Project:** endpnt.dev — Developer API platform
**Repo:** endpnt-dev/color (deployed to color.endpnt.dev)
**Agent routing:** See Agent Workflow section — MANDATORY

---

## ⚠️ CRITICAL: Environment Setup (READ FIRST)

Before doing ANYTHING, run these commands to ensure you're in the right place:

```bash
cd /mnt/c/Repositories/endpnt
# Clone the repo if it's not local yet
if [ ! -d "color" ]; then
  git clone https://github.com/endpnt-dev/color.git
fi
cd color
pwd
# Must show: /mnt/c/Repositories/endpnt/color

git branch
# Must show: * main
# If not on main, run: git checkout main

git status
# Should be clean.
```

Read existing repo contents:

```bash
ls -la
cat CLAUDE.md 2>/dev/null
cat CC-PREFLIGHT.md 2>/dev/null
cat CC-SPEC-ADDENDUM.md 2>/dev/null
```

The repo currently contains only scaffolding docs (`CLAUDE.md`, `CC-PREFLIGHT.md`, `CC-SPEC-ADDENDUM.md`, `README.md`, `.gitignore`). There is NO application code. This is a greenfield build.

**Git workflow — pre-launch mode:**
- Work directly on `main` branch
- Push to `main` — Vercel auto-deploys production at color.endpnt.dev
- NO dev branch workflow during pre-launch

---

## Overview

Build a **Color API** — color manipulation, conversion, and accessibility analysis for developers. Customer sends color values (hex, RGB, etc.) and gets back computed results: conversions between formats, WCAG contrast ratios, harmonious palettes, tints/shades, color blindness simulation.

Target audience: frontend developers building design systems, accessibility auditors checking WCAG compliance, designers generating palettes, anyone implementing color pickers or theme engines. Real demand — existing options (The Color API, colormind.io) are thin, slow, or unreliable.

All operations are pure math: color space transformations are deterministic formulas, WCAG contrast ratios use the defined luminance equation, color harmonies are hue rotations on the color wheel. No external data sources. No proxying.

Deployed to **color.endpnt.dev** as the 9th API in the endpnt.dev lineup.

---

## Reference Implementation

**Use QR repo as your architectural reference.** When in doubt about file structure, middleware, response envelope, error handling, Next.js config, Tailwind, pricing page structure, or docs layout — match QR.

Deliberate divergences from QR:
1. Demo authentication uses the new **server-side proxy pattern (Pattern B)** — no keys in frontend or rendered docs
2. Accent color is a **rainbow gradient or bright spectrum hue** (Color's visual identity fits its thematic purpose)
3. API routes are color operations, not QR generation

Also: Cipher (cipher.endpnt.dev) is being built in parallel in a separate repo with the same Pattern B demo approach. If something about the Pattern B approach is unclear, reference both QR (existing API architecture, Pattern A demo) and Cipher spec (new Pattern B reference). **Do NOT modify files in other repos** — each build is independent.

---

## Requirements

1. API exposes 8 endpoints across 6 operation groups (see Endpoint Catalog)
2. All endpoints return `{ success, data, meta }` envelope
3. API key authentication via `x-api-key` header, validated against shared `API_KEYS` env var
4. Rate limiting via shared Upstash Redis, per-tier limits, sliding window
5. **Demo auth pattern: Pattern B (server-side demo proxy).** No demo key in frontend or docs HTML.
6. Landing page with hero, feature cards, interactive demo showing color conversions live, CTAs
7. Docs page with an interactive tester for each endpoint, plus code examples in cURL, JavaScript, Node.js, Python
8. Pricing page matching shared 4-tier template
9. Health check at `/api/v1/health`
10. Deployed successfully to color.endpnt.dev

---

## Demo Authentication — Pattern B (IMPORTANT)

Do not embed API keys in frontend source or rendered docs. Follow the same pattern as Cipher:

1. Landing page demo calls `/api/demo/[operation]` — SAME-ORIGIN server-side endpoint, NO `x-api-key` header sent
2. Demo endpoint rate-limits by IP (Upstash namespace: `color:demo:{ip}`), reads `DEMO_API_KEY` from env var (NOT committed), internally proxies to `/api/v1/[operation]`
3. If `DEMO_API_KEY` missing at runtime: return `DEMO_UNAVAILABLE` gracefully, don't crash
4. Demo rate limit: 20 requests per IP per 10 minutes

Docs page tester takes user's own API key via an input field. Code examples use placeholder `YOUR_API_KEY` or `ek_your_api_key_here` — never real keys.

---

## Endpoint Catalog

### 1. Convert

**`POST /api/v1/convert`**
- Body: `{ input: string, from?: "hex"|"rgb"|"hsl"|"hsv"|"cmyk"|"lab" (default auto-detect), to: "hex"|"rgb"|"hsl"|"hsv"|"cmyk"|"lab" | "all" }`
- Input formats accepted:
  - Hex: `"#FF5733"`, `"FF5733"`, `"#F53"`
  - RGB: `"rgb(255, 87, 51)"` or object `{r:255,g:87,b:51}` (wrap in string if body is flat)
  - HSL: `"hsl(14, 100%, 60%)"` or object
  - HSV, CMYK, LAB similar
- Response data: `{ input, from, to, result }` — `result` is the converted value in the target format; if `to:"all"`, result is an object with all format keys
- Error codes: `INVALID_COLOR_FORMAT`, `PARSE_ERROR`, `OUT_OF_GAMUT` (for CMYK conversions producing out-of-range values)

### 2. Contrast (WCAG)

**`POST /api/v1/contrast`**
- Body: `{ foreground: string, background: string }` (either hex or RGB string)
- Response data: `{ foreground, background, contrast_ratio: number, wcag: { AA_normal: boolean, AA_large: boolean, AAA_normal: boolean, AAA_large: boolean }, rating: "excellent"|"good"|"poor"|"fail" }`
- Uses WCAG 2.1 relative luminance formula. AA normal = 4.5:1, AA large = 3:1, AAA normal = 7:1, AAA large = 4.5:1.
- Error codes: `INVALID_COLOR_FORMAT`

### 3. Harmonies

**`POST /api/v1/harmony`**
- Body: `{ input: string, type: "complementary"|"triadic"|"analogous"|"split-complementary"|"tetradic"|"square", format?: "hex"|"rgb"|"hsl" (default hex) }`
- Response data: `{ input, type, palette: string[] }` (array of 2-4 color strings including the input)
- Harmonies computed as hue rotations on HSL color wheel:
  - Complementary: +180°
  - Triadic: +120°, +240°
  - Analogous: -30°, +30°
  - Split-complementary: +150°, +210°
  - Tetradic: +60°, +180°, +240°
  - Square: +90°, +180°, +270°

### 4. Palette generation (premium)

**`POST /api/v1/palette`**
- Body: `{ input: string, count?: number (3-10, default 5), algorithm?: "tints"|"shades"|"tones"|"monochromatic"|"balanced" (default balanced) }`
- Response data: `{ input, algorithm, palette: string[] }` (count colors)
- Algorithms:
  - **Tints:** base color mixed with progressively more white
  - **Shades:** base color mixed with progressively more black
  - **Tones:** base color mixed with progressively more gray
  - **Monochromatic:** same hue, varying saturation and lightness
  - **Balanced:** curated Adobe-Color-style palette mixing harmony + lightness variation
- **Starter+ tier only.** Free tier gets HTTP 402 `PREMIUM_FEATURE_REQUIRED`.

### 5. Tints, shades, tones

**`POST /api/v1/tint`** — Generates lighter versions (mix with white)
**`POST /api/v1/shade`** — Generates darker versions (mix with black)
**`POST /api/v1/tone`** — Generates desaturated versions (mix with gray)
- Body for all three: `{ input: string, count?: number (1-10, default 5), intensity?: number (0-1, default 0.1 per step) }`
- Response data: `{ input, operation, variants: string[] }` (count values including input)

### 6. Color blindness simulation

**`POST /api/v1/blindness`**
- Body: `{ input: string, type: "protanopia"|"deuteranopia"|"tritanopia"|"achromatopsia"|"all" }`
- Response data: `{ input, type, simulated: string | object }` — if type is "all", simulated is an object with all 4 types as keys
- Uses the Brettel–Viénot–Mollon simulation matrices (standard for accessibility tooling). Library recommendation: `colorblind` or implement inline using the published matrices.

### 7. Named color lookup

**`POST /api/v1/name`** (also supports GET with query)
- Body/query: `{ input: string }`
- Response data: `{ input, exact_match: boolean, name: string, distance: number, css: boolean }` — closest named color. `exact_match` true if input matches a named color exactly. `css: true` if the name is in CSS standard (e.g., "Tomato"), false if it's a design-system name.
- Uses a bundled list of CSS named colors + an expanded design-system list (~500 total). Delta-E distance for "closest" calculation.

### 8. Health

**`GET /api/v1/health`**
- `{ success: true, status: "ok", version: "1.0.0" }`

---

## Demo Endpoints (Pattern B)

Mirror under `/api/demo/*`, no auth required, rate-limited by IP, internally inject `DEMO_API_KEY`. Implement demos for the explorable operations:

- `/api/demo/convert`
- `/api/demo/contrast`
- `/api/demo/harmony`
- `/api/demo/tint`, `/api/demo/shade`, `/api/demo/tone`
- `/api/demo/blindness`
- `/api/demo/name`

Do NOT implement demo for `/palette` — it's a paid feature, demo could be abused for bulk palette generation.

Landing page demo uses only operations with demo endpoints.

---

## Libraries

- **`colord`** — excellent small color library with plugins for all color space conversions (hex, rgb, hsl, hsv, cmyk, lab). Recommended default.
- Alternative: **`chroma-js`** — larger but broader functionality.
- For color blindness simulation: **`colorblind`** npm package OR implement the Brettel–Viénot–Mollon matrices directly (they're small, ~20 lines of code).
- For named color lookup: bundle a JSON file of CSS + design-system names. No library needed.

Architect picks the exact library stack. Verify APIs via `.d.ts` files before writing calls.

---

## Rate Limits

| Tier | Requests/month | Rate limit | Notes |
|------|---------------|------------|-------|
| Free | 100 | 10/min | No `/palette` access |
| Starter ($29/mo) | 5,000 | 60/min | `/palette` unlocked |
| Pro ($99/mo) | 25,000 | 300/min | |
| Enterprise | Custom | Custom | SLA + support |

---

## Security

**Input limits:**
- Color strings: max 200 chars (generous — actual valid colors are <50 chars)
- Count parameters: capped per endpoint as documented
- No file uploads, no URL fetching — Color API is pure value computation

**Parsing hygiene:** reject malformed color strings with specific error codes. Don't silently coerce invalid input.

---

## File Structure (match QR closely)

```
color/
├── app/
│   ├── api/
│   │   ├── demo/
│   │   │   ├── convert/route.ts
│   │   │   ├── contrast/route.ts
│   │   │   ├── harmony/route.ts
│   │   │   ├── tint/route.ts
│   │   │   ├── shade/route.ts
│   │   │   ├── tone/route.ts
│   │   │   ├── blindness/route.ts
│   │   │   └── name/route.ts
│   │   └── v1/
│   │       ├── health/route.ts
│   │       ├── convert/route.ts
│   │       ├── contrast/route.ts
│   │       ├── harmony/route.ts
│   │       ├── palette/route.ts
│   │       ├── tint/route.ts
│   │       ├── shade/route.ts
│   │       ├── tone/route.ts
│   │       ├── blindness/route.ts
│   │       └── name/route.ts
│   ├── components/
│   │   ├── ApiTester.tsx (docs page)
│   │   ├── ColorDemo.tsx (landing page — uses /api/demo/*)
│   │   ├── ColorSwatch.tsx (visual display of a color result)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PricingCard.tsx
│   ├── docs/page.tsx
│   ├── pricing/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts
│   ├── rate-limit.ts
│   ├── response.ts
│   ├── errors.ts
│   ├── demo-proxy.ts
│   └── color-data/
│       └── named-colors.json (CSS + design-system color names)
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Branding

- **Product name:** Color (straightforward)
- **Subdomain:** color.endpnt.dev
- **Accent color:** Rainbow gradient for hero elements + a primary accent (suggest a rich magenta `#D946EF` or vibrant teal `#06B6D4`). Architect picks primary; rainbow gradients ONLY on hero demo display elements.
- **Hero copy:** "Color conversions, palettes, and accessibility — with one API call" — emphasize accessibility since WCAG contrast + color blindness simulation are strong differentiators
- **Visual:** Lean into colorful UI. This is the one API where rainbow and gradient treatments are on-brand. Landing page demo should include LIVE color swatches that change as the user types a hex code.

---

## Agent Workflow (MANDATORY)

### Phase 1: Planning
Launch `architect` with this spec + QR repo as reference. Architect produces file-by-file plan, locks library choices.

### Phase 2: Implementation
- `backend-agent` for all `/api/v1/*` and `/api/demo/*` routes, `lib/` utilities, named-colors JSON
- `frontend-agent` for landing, docs, pricing pages and color-display components (swatches, palettes, blindness simulations shown side-by-side)
- `cto` coordinates if any change spans both

### Phase 3: Review (NON-NEGOTIABLE)
Launch `review-qa-agent` on full diff. Verify:
- `grep -r "ek_live" .` from repo root returns only `.env.example` placeholders
- All `/api/v1/*` routes require x-api-key
- All `/api/demo/*` routes do NOT require x-api-key
- `/palette` endpoint gates Free tier correctly
- Color parsing rejects malformed input with specific error codes

### Phase 4: Verification
```bash
npm run build
```
Exit 0 required before commit.

### Phase 5: Commit and Deploy
```bash
git add -A
git commit -m "feat: initial Color API — conversions, contrast, harmonies, blindness sim, Pattern B demo"
git push origin main
```

Monitor Vercel until green.

### Phase 6: Smoke Tests
Run against https://color.endpnt.dev.

---

## Vercel Environment Variables

JK sets these after deployment (not CC):

```
API_KEYS (shared)
UPSTASH_REDIS_REST_URL (shared)
UPSTASH_REDIS_REST_TOKEN (shared)
DEMO_API_KEY (NOT committed)
```

First production push will also trigger Vercel to offer custom domain assignment. JK will add `color.endpnt.dev` in Vercel Domains settings after deploy.

---

## DO NOT TOUCH

- **Any other repo** in /mnt/c/Repositories/endpnt/. Stay in `color/` only.
- **`.env` or `.env.local`** files locally if present — gitignored for a reason.
- **Real API keys** — never commit, log, or include in frontend bundles.

---

## Edge Cases

1. **Hex with alpha (e.g., `#FF573380`):** Parse correctly, preserve alpha in output where format supports it (rgba, hsla). Document behavior.
2. **3-char hex (`#F53`):** Expand to 6-char equivalent before processing.
3. **Out-of-gamut conversions:** Converting sRGB to CMYK often produces values outside standard ranges. Return result anyway but include `out_of_gamut: true` flag. Don't error.
4. **Invalid hex (`#ZZZZZZ`):** Return `INVALID_COLOR_FORMAT` with message explaining valid formats.
5. **Contrast with identical colors:** Return `contrast_ratio: 1`, all WCAG booleans false, `rating: "fail"`.
6. **Palette count=1:** Return array with just the input color. Not an error.
7. **Harmony on grayscale (achromatic) color:** Harmonies are defined by hue; gray has no meaningful hue. Return same color for all slots with a warning in meta.
8. **Named color lookup with near-exact match (Delta-E < 1):** Return `exact_match: false` but `distance: <1` — document this as "visually identical."
9. **Blindness simulation of pure gray:** Returns the same gray (grays are unaffected by red-green-blue deficiencies). Not an error.

---

## Library API Verification (MANDATORY)

- Read `node_modules/colord/index.d.ts` before using colord
- Verify plugin loading works in Next.js serverless environment (colord uses a plugin system — plugins must be imported)
- Read the Brettel matrices documentation if implementing blindness simulation inline

Reject any code using options not present in TypeScript definitions.

---

## Smoke Tests

Run against `https://color.endpnt.dev`.

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|----------|-------|-----------------|-----------|
| 1 | Health check | `curl https://color.endpnt.dev/api/v1/health` | `{"success": true, "status": "ok"}` | |
| 2 | Demo convert no-auth | `curl -X POST https://color.endpnt.dev/api/demo/convert -H "Content-Type: application/json" -d '{"input":"#FF5733","to":"rgb"}'` (NO x-api-key) | `{"success": true, "data": {"result": "rgb(255, 87, 51)" or {r:255,g:87,b:51}, ...}}` | |
| 3 | v1 endpoint requires auth | Same as #2 but hitting `/api/v1/convert`, no x-api-key | HTTP 401, `AUTH_REQUIRED` | |
| 4 | Convert to all formats | POST /api/v1/convert with demo key, `{"input":"#FF5733","to":"all"}` | Response includes hex, rgb, hsl, hsv, cmyk, lab values | |
| 5 | Invalid hex | POST /api/v1/convert with `{"input":"#ZZZZZZ","to":"rgb"}` | HTTP 400, `INVALID_COLOR_FORMAT` | |
| 6 | Contrast — high contrast | POST /api/v1/contrast `{"foreground":"#000000","background":"#FFFFFF"}` | `contrast_ratio: 21`, all WCAG true | |
| 7 | Contrast — poor contrast | POST /api/v1/contrast `{"foreground":"#AAAAAA","background":"#CCCCCC"}` | Low ratio (~1.6), AA_normal: false | |
| 8 | Harmony complementary | POST /api/v1/harmony `{"input":"#FF0000","type":"complementary"}` | Returns `["#FF0000", "#00FFFF"]` or similar (exact cyan) | |
| 9 | Harmony triadic | POST /api/v1/harmony `{"input":"#FF0000","type":"triadic"}` | Returns 3 colors at 0°, 120°, 240° hue | |
| 10 | Palette (Starter+ only) | POST /api/v1/palette with FREE-tier key | HTTP 402, `PREMIUM_FEATURE_REQUIRED` | |
| 11 | Tints | POST /api/v1/tint `{"input":"#FF5733","count":5}` | 5 progressively lighter variants | |
| 12 | Shades | POST /api/v1/shade `{"input":"#FF5733","count":5}` | 5 progressively darker variants | |
| 13 | Blindness protanopia | POST /api/v1/blindness `{"input":"#FF0000","type":"protanopia"}` | Returns a simulated color (typically yellowish/olive for red under protanopia) | |
| 14 | Blindness all types | POST /api/v1/blindness `{"input":"#FF0000","type":"all"}` | Returns object with protanopia, deuteranopia, tritanopia, achromatopsia keys | |
| 15 | Named color exact | POST /api/v1/name `{"input":"#FF0000"}` | `name: "Red", exact_match: true, css: true` | |
| 16 | Named color closest | POST /api/v1/name `{"input":"#FF0001"}` | `name: "Red", exact_match: false, distance: <1` | |
| 17 | Rate limit on free | 11 requests in <1min with free-tier key | 11th = HTTP 429 | |
| 18 | Demo rate limit | 21 requests to /api/demo/convert from same IP | 21st = `DEMO_RATE_LIMITED` | |
| 19 | Landing page loads | Visit https://color.endpnt.dev | Landing renders with hero, feature cards, live color demo, CTAs | |
| 20 | Landing demo works | Enter hex, see live conversion + contrast + swatches | Demo responds without 401 errors, no key in network tab | |
| 21 | No keys in source | Inspect page source + JS bundles on landing and /docs | Zero occurrences of "ek_live_" | |
| 22 | Docs page loads | Visit /docs | Full docs with interactive testers for all 8 endpoints, code examples in 4 languages | |
| 23 | Pricing page loads | Visit /pricing | 4 tiers, Free/Starter/Pro/Enterprise | |

---

## Status Report Required

```
Status: COMPLETE | IN PROGRESS | BLOCKED

Agents invoked:
- architect: [yes/no] — [key decisions]
- backend-agent: [yes/no] — [endpoints built]
- frontend-agent: [yes/no] — [pages/components built]
- review-qa-agent: [yes/no] — [findings addressed]

Build:
- npm run build: exit 0 | exit N
- TypeScript errors: [count]

Deployment:
- Commit hash: [hash]
- Pushed to: main
- Vercel: green | red | pending

Smoke tests: X of 23 passing
- Failing: [list]

Security verifications:
- `grep -r "ek_live" .` returns: [what]
- DEMO_API_KEY runtime-only: [yes/no]
- `/palette` tier gating verified: [yes/no]

Issues still open: [list]
```

---

## What Comes Next

After deployment + smoke tests pass:
1. JK sets `DEMO_API_KEY` in Vercel env
2. JK adds `color.endpnt.dev` as custom domain in Vercel Domains settings
3. JK adds CNAME record in Hostinger (`color` → `cname.vercel-dns.com`)
4. JK lists Color on RapidAPI and Postman
5. Hub site updated to feature Color as the 9th API (separate spec)
6. Tomorrow: polish pass across other APIs using Color + Cipher as Pattern B references
