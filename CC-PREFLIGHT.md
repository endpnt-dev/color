# CC Pre-Flight Checklist — Read This Before Writing Any Code

This checklist captures hard-won lessons from the endpnt PDF API build. Follow it for EVERY endpnt API build.

---

## 1. Next.js 14 config syntax (NOT Next 15)

This project uses **Next 14.2.x**. The config keys differ between versions; CC's training data may default to Next 15 patterns.

### ✅ Correct for Next 14:
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['package-name'],
  },
}
```

### ❌ WRONG (Next 15 only):
```javascript
const nextConfig = {
  serverExternalPackages: ['package-name'],  // top-level — Next 15 only
  turbopack: {},  // Next 15 only
}
```

**Verification:** https://nextjs.org/docs/14/app/api-reference/next-config-js/serverComponentsExternalPackages

---

## 2. Mandatory local build before every push

**DO NOT `git push` without first running `npm run build` locally and confirming exit code 0.**

```bash
npm run build           # MUST pass before push
git add -A && git commit -m "..."
git push origin main
```

If build fails locally: fix it, re-run, only push when green.

---

## 3. Library API verification — don't trust training data

For any library function you're about to call with an options object, verify the options shape by:
1. Reading the library's TypeScript definitions (`node_modules/<lib>/dist/*.d.ts`)
2. Or checking the library's official API docs
3. NOT relying on memory alone

If TypeScript catches an options mismatch, you hallucinated — rewrite using verified options.

---

## 4. Native modules on Vercel

Packages with `.node` binaries (like `@napi-rs/canvas`, `sharp`) need:

### In `next.config.js`:
```javascript
experimental: {
  serverComponentsExternalPackages: ['@napi-rs/canvas', 'sharp'],
},
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = [
      ...(config.externals || []),
      { '@napi-rs/canvas': 'commonjs @napi-rs/canvas' },
    ];
  }
  return config;
},
```

### Vercel build environment:
- Does NOT have `apt-get` (no root access, Amazon Linux base)
- Does NOT allow system package installation during build
- DOES support bundling binaries via `outputFileTracingIncludes`

---

## 5. Verify third-party libraries are actively maintained

Before using a library, check:
- When was the last npm release?
- Any GitHub "unmaintained" / "maintenance mode" notices?
- Weekly downloads trending?

If no release in 18+ months, find an actively-maintained alternative.

---

## 6. Error handling categorization

```typescript
try {
  // ... operation
} catch (error: any) {
  const message = error.message || '';
  
  if (message.includes('<specific error indicator>')) {
    return errorResponse('SPECIFIC_ERROR_CODE', 'Helpful message', 400);
  }
  
  console.error('Operation error:', message);
  return errorResponse('PROCESSING_FAILED', 'Operation failed', 500);
}
```

Generic 500s are a bad customer experience. Invest in error categorization.

---

## 7. Standard response envelope

### Success:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "request_id": "...", "processing_ms": 245, "remaining_credits": 4847 }
}
```

### Error:
```json
{
  "success": false,
  "error": { "code": "SPECIFIC_ERROR_CODE", "message": "..." },
  "meta": { "request_id": "..." }
}
```

Use `lib/response.ts` (copied from validate/qr/convert). Don't invent a new shape.

---

## 8. Shared env vars (already set in Vercel)

ALREADY configured:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `API_KEYS`

Use as-is. Do not rename or recreate with different values.

---

## 9. /tmp file cleanup (if applicable)

If writing temp files during a request:

```typescript
const inputPath = join(tmpdir(), `op-${randomUUID()}.ext`);
try {
  await writeFile(inputPath, buffer);
  // ... do work
  return result;
} finally {
  await unlink(inputPath).catch(() => {});
}
```

Without finally, /tmp fills up across invocations.

---

## 10. Stopping conditions

Stop and escalate to a fix spec (rather than pushing again) if:
- Same build error repeats across 2+ attempts
- CC-generated fix contradicts the spec
- A library API doesn't match TypeScript definitions
- Build succeeds locally but fails on Vercel with a new error class
