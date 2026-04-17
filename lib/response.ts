import { NextResponse } from 'next/server'
import { ErrorCode } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: ErrorCode
    message: string
  }
  meta?: {
    request_id?: string
    processing_ms?: number
    remaining_credits?: number
  }
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  )
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
      meta,
    },
    { status }
  )
}

export function generateRequestId(): string {
  return `req_${Math.random().toString(36).slice(2, 10)}`
}

export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    AUTH_REQUIRED: 'API key is required. Include x-api-key header.',
    INVALID_API_KEY: 'Invalid API key. Check your credentials.',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
    INVALID_COLOR_FORMAT: 'Invalid color format. Check the color value.',
    PARSE_ERROR: 'Failed to parse color input. Check the format.',
    OUT_OF_GAMUT: 'Color value is out of the supported color gamut.',
    UNSUPPORTED_HARMONY_TYPE: 'Unsupported harmony type. Check available options.',
    UNSUPPORTED_OPERATION: 'Unsupported operation. Check the endpoint documentation.',
    PREMIUM_FEATURE_REQUIRED: 'This feature requires Starter tier or higher.',
    DEMO_UNAVAILABLE: 'Demo service temporarily unavailable.',
    INTERNAL_ERROR: 'Internal server error. Please try again later.',
  }
  return messages[code]
}