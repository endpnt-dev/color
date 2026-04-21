export const API_VERSION = '1.0.0'

export const TIER_LIMITS = {
  free: {
    requests_per_minute: 10,
    requests_per_month: 100
  },
  starter: {
    requests_per_minute: 60,
    requests_per_month: 5000
  },
  pro: {
    requests_per_minute: 300,
    requests_per_month: 25000
  },
  enterprise: {
    requests_per_minute: 1000,
    requests_per_month: 100000
  },
} as const

export const COLOR_LIMITS = {
  input_max_length: 200,
  count_min: 1,
  count_max: 10,
  tint_shade_tone_max: 10,
  palette_min: 3,
  palette_max: 10,
  harmony_formats: ['hex', 'rgb', 'hsl'] as const,
  color_formats: ['hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'lab'] as const,
  harmony_types: [
    'complementary',
    'triadic',
    'analogous',
    'split-complementary',
    'tetradic',
    'square'
  ] as const,
  palette_algorithms: [
    'tints',
    'shades',
    'tones',
    'monochromatic',
    'balanced'
  ] as const,
  blindness_types: [
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'achromatopsia'
  ] as const,
}

export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_COLOR_FORMAT: 'INVALID_COLOR_FORMAT',
  PARSE_ERROR: 'PARSE_ERROR',
  OUT_OF_GAMUT: 'OUT_OF_GAMUT',
  UNSUPPORTED_HARMONY_TYPE: 'UNSUPPORTED_HARMONY_TYPE',
  UNSUPPORTED_OPERATION: 'UNSUPPORTED_OPERATION',
  PREMIUM_FEATURE_REQUIRED: 'PREMIUM_FEATURE_REQUIRED',
  DEMO_UNAVAILABLE: 'DEMO_UNAVAILABLE',
  ORIGIN_NOT_ALLOWED: 'ORIGIN_NOT_ALLOWED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export const DEMO_RATE_LIMIT = {
  requests_per_window: 20,
  window_minutes: 10,
} as const

export const WCAG_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const

export type ApiTier = keyof typeof TIER_LIMITS
export type ErrorCode = keyof typeof ERROR_CODES
export type ColorFormat = typeof COLOR_LIMITS.color_formats[number]
export type HarmonyFormat = typeof COLOR_LIMITS.harmony_formats[number]
export type HarmonyType = typeof COLOR_LIMITS.harmony_types[number]
export type PaletteAlgorithm = typeof COLOR_LIMITS.palette_algorithms[number]
export type BlindnessType = typeof COLOR_LIMITS.blindness_types[number]