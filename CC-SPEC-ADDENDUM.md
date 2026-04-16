# CC Spec Addendum — Color API

**Read this BEFORE CC-SPEC.md.** These are additions discovered after the main spec was drafted, incorporating lessons from the PDF API build.

---

## 1. Read CC-PREFLIGHT.md first

Before any code is written, read `CC-PREFLIGHT.md` in this same directory.

## 2. Mandatory local `npm run build` before every push

**Never `git push` without running `npm run build` locally first and confirming exit 0.**

```bash
npm run build           # Must exit 0
git add -A && git commit -m "..."
git push origin main
```

## 3. CRITICAL — node-vibrant v4 API changes

**node-vibrant shipped a major v4 release recently (April 2026).** The API changed significantly from v3. CC's training data may default to v3 patterns that no longer work. Verify the v4 API BEFORE writing palette extraction code.

### v4 changes (confirmed via GitHub releases):

1. **New import paths required** — you MUST import from a specific environment:
   ```typescript
   // ✅ CORRECT v4 — for server-side
   import { Vibrant } from "node-vibrant/node";
   
   // ❌ WRONG — v3 pattern, fails in v4
   import Vibrant from "node-vibrant";
   ```

2. **Promise-only API** — callbacks are removed. Use `.then()` or `await`.

3. **`names` API removed** — the `getNamedSwatch` pattern from v3 no longer exists.

4. **Builder pattern preserved** — `Vibrant.from('path').getPalette()` still works.

### Verify the actual API before implementing:

```bash
# After npm install, read the TypeScript definitions:
cat node_modules/node-vibrant/dist/node/index.d.ts
```

If CC writes code that imports `from "node-vibrant"` (no subpath), the build will fail or runtime behavior will be broken. Confirm the import path matches v4.

### Fallback if node-vibrant v4 has serverless issues:

If v4 consistently fails on Vercel despite correct imports, implement the fallback from CC-SPEC.md: decode the image with sharp → downsample to 100x100 → run k-means clustering on pixel buffer. Slower but guaranteed to work.

## 4. Native module handling — sharp

Sharp has native bindings and needs the Next 14 externalization pattern:

```javascript
// next.config.js
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

Sharp is battle-tested on Vercel — don't need to worry about it as long as externalized correctly.

## 5. culori is pure-JS, no concerns

culori has zero native dependencies. Safe to use without special config.

## 6. Color format parsing — verify culori's exact API

Before writing the convert endpoint, read `node_modules/culori/dist/index.d.ts` to verify:

- `parse(colorString)` signature and return type
- `formatHex(color)`, `formatRgb(color)`, `formatHsl(color)`, etc.
- OKLCH/OKLAB converter names (`oklch`, `oklab` should be importable)

Don't call culori functions from memory. CC's training data for culori may be outdated.

## 7. Palette endpoint resource config

Palette extraction is more CPU-intensive than other color operations. Configure in `vercel.json`:

```json
{
  "functions": {
    "app/api/v1/palette/route.ts": { "maxDuration": 30, "memory": 1024 }
  }
}
```

Other color endpoints (convert, contrast, harmony, manipulate, name) are instant — no special config needed.

## 8. APCA contrast algorithm

Per main spec, we offer both WCAG 2.1 and APCA. APCA uses `apca-w3` npm package. Its API:

```typescript
import { APCAcontrast, sRGBtoY } from 'apca-w3';
// APCAcontrast returns an Lc value, NOT a ratio
// Pass/fail thresholds differ from WCAG (Lc 60 for body text)
```

Verify the exact exported function names before implementing. Recent versions have used both `APCAcontrast` and `apcaContrast` depending on version.
