/**
 * Demo proxy configuration for origin-based access control
 *
 * Phase 0 of demo-proxy standardization: allow null origins (mobile apps, direct API calls)
 * per architect recommendation. Future phases may tighten this.
 */

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://color.endpnt.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const

export type AllowedOrigin = typeof DEFAULT_ALLOWED_ORIGINS[number]