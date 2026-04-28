# CLAUDE.md — Color API Specific Rules

**This file supplements `C:\Repositories\endpnt\CLAUDE.md` (platform-wide rules).** Read both. Universal rules (definition of done, mandatory workflow, agent usage, status-report honesty, etc.) are in the platform file. Only Color-specific guidance lives here.

> **History note:** A previous version of this file documented `culori`, `node-vibrant`, `sharp`, `apca-w3`, and `color-name-list` — none of which are actually installed. The doc was written during planning before the implementation chose `colord` + `@bjornlu/colorblind` instead. CO-001 (2026-04-24 biweekly audit) tracked the documentation drift; this rewrite resolves it 2026-04-27.

---

## Library Stack — Actual

The Color API uses TWO runtime libraries plus a static JSON file. Everything else is Next.js, React, or Tailwind.

| Library | Version | Purpose | Used in |
|---|---|---|---|
| `colord` | `^2.9.3` | Core color operations: parsing, format conversion, harmony generation, contrast (WCAG), manipulation (tints/shades/tones) | `lib/color/colord-setup.ts`, `lib/color/parse.ts`, `lib/color/convert.ts`, `lib/color/harmony.ts`, `lib/color/contrast.ts`, `lib/color/variants.ts`, `lib/color/palette.ts` |
| `@bjornlu/colorblind` | `^1.0.3` | Color-blindness simulation (protanopia, deuteranopia, tritanopia, achromatopsia) | `lib/color/blindness.ts` |
| `lib/color-data/named-colors.json` | (local) | CSS named-color lookup (147 standard names) for `/api/v1/name` | `lib/color/name.ts` |

**There is no image processing in this API.** No `sharp`, no `node-vibrant`. The `palette` endpoint generates palettes algorithmically from a single input color (using `colord`'s tint/shade/tone/harmony plugins), not by extracting dominant colors from an uploaded image.

---

## colord Plugin Setup

`colord` is a small core; everything beyond hex/RGB/HSL needs an extension plugin. The Color API loads 8 plugins at module init (`lib/color/colord-setup.ts`):

```typescript
import { extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import labPlugin from 'colord/plugins/lab'
import lchPlugin from 'colord/plugins/lch'
import hwbPlugin from 'colord/plugins/hwb'
import harmoniesPlugin from 'colord/plugins/harmonies'
import a11yPlugin from 'colord/plugins/a11y'
import mixPlugin from 'colord/plugins/mix'
import namesPlugin from 'colord/plugins/names'

extend([
  cmykPlugin,
  labPlugin,
  lchPlugin,
  hwbPlugin,
  harmoniesPlugin,
  a11yPlugin,
  mixPlugin,
  namesPlugin,
])

export { colord } from 'colord'
```

**Always import `colord` from `lib/color/colord-setup.ts`**, NOT directly from `'colord'`. Importing the bare package gives you an unextended core that throws on `.toCmyk()`, `.toLab()`, `.contrast()`, etc.

### Plugin coverage

| Plugin | Methods enabled |
|---|---|
| `cmyk` | `colord(...).toCmyk()` |
| `lab` | `colord(...).toLab()` |
| `lch` | `colord(...).toLch()` |
| `hwb` | `colord(...).toHwb()` |
| `harmonies` | `colord(...).harmonies('triadic' \| 'complementary' \| 'analogous' \| ...)` |
| `a11y` | `colord(...).contrast(other)`, `colord(...).isReadable(other, ...)` |
| `mix` | `colord(...).mix(other, amount)`, `tints()`, `shades()`, `tones()` |
| `names` | `colord('blueviolet')` parses CSS color names |

### Verify before use

If you're adding a new endpoint that needs a colord method not yet used:

```bash
cat node_modules/colord/types/index.d.ts            # core types
cat node_modules/colord/types/plugins/lab.d.ts      # per-plugin types
ls node_modules/colord/plugins/                     # full plugin list
```

Don't call colord methods from memory — plugin coverage matters and missing extensions throw at runtime.

---

## @bjornlu/colorblind API

Used only in `lib/color/blindness.ts`. The library exports a single `simulate()` function:

```typescript
import { simulate, type Deficiency } from '@bjornlu/colorblind'

const result = simulate({ r: 255, g: 100, b: 50 }, 'protanopia')
// result is { r, g, b } — an RGB object
```

`Deficiency` type is the union: `'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'`.

The function takes a plain RGB object (not a colord instance), so the workflow is:

```typescript
const color = parseColor(input)          // colord instance
const rgb = color.toRgb()                 // { r, g, b, a }
const rgbInput = { r: rgb.r, g: rgb.g, b: rgb.b }   // strip alpha
const simulated = simulate(rgbInput, deficiency)
```

---

## Native Module Handling

`next.config.js` externalizes both runtime libraries:

```javascript
experimental: {
  serverComponentsExternalPackages: [
    'colord',
    '@bjornlu/colorblind'
  ]
},
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'colord': false,
      '@bjornlu/colorblind': false,
      fs: false,
      path: false,
    }
  }
  return config
}
```

Neither library has native bindings (both are pure JS), so externalization is mostly about keeping bundle size reasonable on the client. The webpack `resolve.fallback` block prevents accidental client-side import errors.

---

## Color Name Lookup — Static JSON

`/api/v1/name` does NOT use a library. It reads `lib/color-data/named-colors.json` at module init and finds the closest match by Euclidean distance in RGB space.

The JSON shape:

```json
{
  "css": {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    ...
  }
}
```

If you need to extend the corpus beyond CSS named colors (e.g., add Pantone, X11, etc.), it's adding entries to the JSON, not swapping the library.

---

## Contrast — WCAG Only (no APCA)

`/api/v1/contrast` uses `colord`'s `a11yPlugin.contrast()` method which returns a WCAG contrast ratio.

Response shape:

```json
{
  "contrast_ratio": 4.5,
  "wcag": {
    "AA_normal": true,
    "AA_large": true,
    "AAA_normal": false,
    "AAA_large": true
  },
  "rating": "good"
}
```

**There is no APCA support.** If a future spec adds APCA, it would require installing `apca-w3` and adding a new field to the response.

---

## Palette Endpoint — Algorithmic, Not Image-Based

`/api/v1/palette` takes a SINGLE color string + algorithm + count, and generates a palette algorithmically:

| `algorithm` value | What it does |
|---|---|
| `tints` | N progressively lighter variants |
| `shades` | N progressively darker variants |
| `tones` | N progressively desaturated variants |
| `monochromatic` | Mix of tints/shades sharing the input hue |
| `balanced` | Algorithmic mix of harmony + variants |

**Note:** `docs/API-CATALOG.md` and `web/lib/apis.ts` describe the palette endpoint as "extract dominant colors from an image." This is **incorrect** — it predates the implementation and was never reconciled. A future bug entry should be opened for the catalog update; CO-001 only covers this CLAUDE.md.

---

## Function Resource Config

Per `vercel.json`:

- `/api/v1/palette` — `maxDuration: 30`, `memory: 1024` (in case of complex algorithm runs; in practice the work is trivial)
- All other color endpoints — default config, instant return

If/when image-based palette extraction is added in the future, the resource config will need to grow accordingly.

---

## Color-Specific Error Codes

Beyond platform errors:

- `INVALID_COLOR_FORMAT` (400) — Input string couldn't be parsed by colord
- `PARSE_ERROR` (400) — Generic parse failure
- `OUT_OF_GAMUT` (400) — Target format can't represent the color (e.g., LAB → CMYK loss)
- `UNSUPPORTED_HARMONY_TYPE` (400) — Harmony type not in colord's allowlist
- `UNSUPPORTED_OPERATION` (400) — Operation not supported for the input

(`FILE_TOO_LARGE`, `INVALID_IMAGE`, `IMAGE_FETCH_FAILED`, `PALETTE_EXTRACTION_FAILED` from the previous version of this doc are NOT in use — there's no image handling. Removed.)

---

## Tier-Gating: `/api/v1/palette` is Starter+

Free tier returns `402 PREMIUM_FEATURE_REQUIRED` for the palette endpoint. Logic lives in `lib/auth.ts` / `lib/config.ts` — the platform CLAUDE.md's API Key Handling section covers the general pattern; check there before adjusting tier rules here.

The demo proxy at `/api/demo/palette` is **not exposed** for the same reason — palette is Starter+ only, and the demo would contradict the gate.

---

## Demo Proxy Pattern

Color is one of two repos using the canonical demo-proxy pattern (the other is cipher). The helper lives at `lib/demo-proxy.ts` and is built per `docs/DEMO-PROXY-CONTRACTS.md` at the platform level.

If modifying `lib/demo-proxy.ts`, READ the platform contract doc first. The helper has implicit dependencies on `lib/response.ts`, `lib/rate-limit.ts`, and `lib/config.ts` — all four files must stay aligned.

---

## DO NOT TOUCH

- `lib/color/colord-setup.ts` — modifying the plugin list will silently break methods used elsewhere. Add a plugin only when adding a new method that requires it; never remove.
- `lib/color-data/named-colors.json` — read-only JSON, no parsing magic. Don't transform it.
- The webpack `resolve.fallback` config in `next.config.js` — accidentally removing those `false` entries will break client-side bundling.
