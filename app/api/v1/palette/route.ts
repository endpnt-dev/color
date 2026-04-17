import { NextRequest } from 'next/server'
import { validateApiKey, getApiKeyFromHeaders, requiresStarterTier } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { successResponse, errorResponse, generateRequestId, getErrorMessage } from '@/lib/response'
import { validateInput, validateEnum, validateRange, ColorApiError } from '@/lib/errors'
import { COLOR_LIMITS } from '@/lib/config'
import { generatePalette } from '@/lib/color/palette'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Get API key from headers
    const apiKey = getApiKeyFromHeaders(request.headers)
    const keyInfo = validateApiKey(apiKey)

    if (!keyInfo) {
      return errorResponse(
        'AUTH_REQUIRED',
        getErrorMessage('AUTH_REQUIRED'),
        401,
        { request_id: requestId }
      )
    }

    // Check tier requirement - Palette is Starter+ only
    if (!requiresStarterTier(keyInfo.tier)) {
      return errorResponse(
        'PREMIUM_FEATURE_REQUIRED',
        getErrorMessage('PREMIUM_FEATURE_REQUIRED'),
        402,
        { request_id: requestId }
      )
    }

    // Check rate limits
    const rateLimitResult = await checkRateLimit(apiKey!, keyInfo.tier)
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        getErrorMessage('RATE_LIMIT_EXCEEDED'),
        429,
        {
          request_id: requestId,
          remaining_credits: rateLimitResult.remaining
        }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const input = validateInput(body.input, 'input', COLOR_LIMITS.input_max_length)

    let count = body.count || 5
    if (typeof count === 'string') count = parseInt(count)
    count = validateRange(count, COLOR_LIMITS.palette_min, COLOR_LIMITS.palette_max, 'count')

    let algorithm = body.algorithm || 'balanced'
    algorithm = validateEnum(algorithm, COLOR_LIMITS.palette_algorithms, 'algorithm')

    // Generate palette
    const result = generatePalette({ input, count, algorithm })

    return successResponse(
      result,
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime,
        remaining_credits: rateLimitResult.remaining
      }
    )
  } catch (error) {
    if (error instanceof ColorApiError) {
      return errorResponse(
        error.code,
        error.message,
        error.statusCode,
        {
          request_id: requestId,
          processing_ms: Date.now() - startTime
        }
      )
    }

    console.error('Palette endpoint error:', error)
    return errorResponse(
      'INTERNAL_ERROR',
      getErrorMessage('INTERNAL_ERROR'),
      500,
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime
      }
    )
  }
}