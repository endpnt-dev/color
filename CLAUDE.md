# CLAUDE.md — Color API Specific Rules

**This file supplements `C:\Repositories\endpnt\CLAUDE.md` (platform-wide rules).** Read both. Universal rules (definition of done, mandatory workflow, agent usage, status-report honesty, etc.) are in the platform file. Only Color-specific guidance lives here.

---

## CRITICAL: node-vibrant v4 Breaking Changes

**node-vibrant shipped a major v4 release recently.** The API changed significantly from v3. CC's training data may default to v3 patterns that no longer work.

### Required v4 import path

```typescript
// ✅ CORRECT v4 — for server-side
import { Vibrant } from "node-vibrant/node";

// ❌ WRONG — v3 pattern, fails in v4
import Vibrant from "node-vibrant";
```

### Other v4 changes

- **Promise-only API** — callbacks are removed
- **`names` API removed** — the `getNamedSwatch` pattern from v3 no longer exists
- **Builder pattern preserved** — `Vibrant.from('path').getPalette()` still works

### Verify before implementing

```bash
# After npm install:
cat node_modules/node-vibrant/dist/node/index.d.ts
```

If you import `from "node-vibrant"` (no subpath), the build will fail or runtime behavior will be broken. Always use the `/node` subpath for this server-side API.

---

## Library Choices

| Library | Purpose | Notes |
|---|---|---|
| `culori` | Color operations, format conversion | Pure JS. Supports OKLCH/OKLAB (differentiator vs chroma-js) |
| `node-vibrant` v4 | Palette extraction | See v4 breaking changes above |
| `sharp` | Image preprocessing for palette | Downsample to 100x100 before palette extraction for speed |
| `apca-w3` | APCA contrast algorithm | Verify function naming: `APCAcontrast` vs `apcaContrast` varies by version |
| `color-name-list` | Color naming | 30k+ named colors |

---

## Native Module Handling

Sharp has native bindings and needs Next 14 externalization:

```javascript
experimental: {
  serverComponentsExternalPackages: ['sharp', 'node-vibrant'],
},
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = [
      ...(config.externals || []),
      { 'sharp': 'commonjs sharp' },
    ];
  }
  return config;
},
```

Sharp is battle-tested on Vercel — no other concerns.

---

## Palette Extraction: Downsample First

Full-resolution palette extraction is slow and unnecessary. Always downsample with Sharp BEFORE running node-vibrant:

```typescript
const smallImage = await sharp(imageBuffer)
  .resize(200, 200, { fit: 'inside' })
  .toBuffer();

const palette = await Vibrant.from(smallImage).getPalette();
```

Results are nearly identical to full-resolution, but ~100x faster. Don't skip this.

---

## APCA Function Naming

`apca-w3` package exports have changed across versions. Before implementing:

```bash
cat node_modules/apca-w3/package.json   # Check version
cat node_modules/apca-w3/src/apca-w3.d.ts  # Check exports
```

Recent versions may export `APCAcontrast` OR `apcaContrast` OR both. Use whatever exists in your installed version.

APCA returns an Lc value, NOT a ratio. Pass/fail thresholds differ from WCAG:
- Lc 60 → body text
- Lc 45 → large text
- Lc 30 → minimum for any readable text

---

## culori API — verify before use

Before writing the convert endpoint, read `node_modules/culori/dist/index.d.ts` to verify:

- `parse(colorString)` signature and return type
- `formatHex(color)`, `formatRgb(color)`, `formatHsl(color)`, etc.
- OKLCH/OKLAB converter names

culori's exports have changed over versions. Don't call from memory.

---

## Function Resource Config

Per `vercel.json`:

- `/api/v1/palette` — `maxDuration: 30`, `memory: 1024` (CPU-intensive k-means clustering)
- Other color endpoints (convert, contrast, harmony, manipulate, name) — default config, they're instant

---

## Color-Specific Error Codes

Beyond platform errors:
- `INVALID_COLOR_FORMAT` (400)
- `UNSUPPORTED_HARMONY_TYPE` (400)
- `UNSUPPORTED_OPERATION` (400)
- `FILE_TOO_LARGE` (400)
- `INVALID_IMAGE` (400)
- `IMAGE_FETCH_FAILED` (400)
- `PALETTE_EXTRACTION_FAILED` (500)

---

## Fallback if node-vibrant v4 has Vercel issues

If node-vibrant v4 consistently fails on Vercel despite correct imports:

1. First, verify the import path is exactly `node-vibrant/node` (not bare `node-vibrant`)
2. If still failing, implement manual k-means clustering:
   - Decode image with Sharp
   - Downsample to 100x100
   - Extract pixel buffer
   - Run k-means on RGB tuples
   - Return dominant colors

Slower but guaranteed to work. Keep it as the last resort.
