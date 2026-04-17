import { NextRequest } from 'next/server'
import { validateApiKey, getApiKeyFromHeaders } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { successResponse, errorResponse, generateRequestId, getErrorMessage } from '@/lib/response'
import { ColorApiError, validateInput, validateEnum } from '@/lib/errors'
import { COLOR_LIMITS } from '@/lib/config'
import { convertColor } from '@/lib/color/convert'

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

    let from = body.from
    if (from) {
      from = validateEnum(from, COLOR_LIMITS.color_formats, 'from')
    }

    const to = body.to
    if (!to) {
      throw new ColorApiError('PARSE_ERROR', 'Missing required field: to')
    }

    if (to !== 'all') {
      validateEnum(to, COLOR_LIMITS.color_formats, 'to')
    }

    // Convert color
    const result = convertColor({ input, from, to })

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

    console.error('Convert endpoint error:', error)
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