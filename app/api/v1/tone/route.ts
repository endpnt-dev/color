import { NextRequest } from 'next/server'
import { validateApiKey, getApiKeyFromHeaders } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { successResponse, errorResponse, generateRequestId, getErrorMessage } from '@/lib/response'
import { validateInput, validateRange, ColorApiError } from '@/lib/errors'
import { COLOR_LIMITS } from '@/lib/config'
import { generateTones } from '@/lib/color/variants'

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
    count = validateRange(count, COLOR_LIMITS.count_min, COLOR_LIMITS.tint_shade_tone_max, 'count')

    let intensity = body.intensity
    if (intensity !== undefined) {
      if (typeof intensity === 'string') intensity = parseFloat(intensity)
      intensity = validateRange(intensity, 0, 1, 'intensity')
    }

    // Generate tones
    const result = generateTones({ input, count, intensity })

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

    console.error('Tone endpoint error:', error)
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