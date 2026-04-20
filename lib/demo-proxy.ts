import { NextRequest, NextResponse } from 'next/server'
import { checkDemoRateLimit } from './rate-limit'
import { errorResponse, generateRequestId } from './response'

export interface DemoProxyOptions {
  endpoint: string
  allowedMethods?: string[]
}

export async function demoProxy(
  request: NextRequest,
  options: DemoProxyOptions
): Promise<NextResponse> {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // Check method
  const allowedMethods = options.allowedMethods || ['GET', 'POST']
  if (!allowedMethods.includes(request.method)) {
    return errorResponse(
      'UNSUPPORTED_OPERATION',
      `Method ${request.method} not allowed for demo endpoint`,
      405,
      { request_id: requestId }
    )
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           'unknown'

  // Check demo rate limit
  const rateLimitResult = await checkDemoRateLimit(ip)
  if (!rateLimitResult.allowed) {
    return errorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Demo rate limit exceeded. Please try again later.',
      429,
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime,
        remaining_credits: rateLimitResult.remaining
      }
    )
  }

  // Check if demo API key is available
  const demoApiKey = process.env.DEMO_API_KEY
  if (!demoApiKey) {
    return errorResponse(
      'DEMO_UNAVAILABLE',
      'Demo service temporarily unavailable',
      503,
      { request_id: requestId }
    )
  }

  try {
    // Prepare request to internal API — derive base URL from incoming request
    // so it works across all deploy contexts (custom domain, preview, localhost).
    // DO NOT use process.env.VERCEL_URL — that returns deployment-specific URL,
    // not the custom domain, which causes internal fetches to fail in production.
    const targetUrl = new URL(`/api/v1${options.endpoint}`, request.url).toString()

    // Forward the request with demo API key
    const headers = new Headers()
    headers.set('x-api-key', demoApiKey)
    headers.set('content-type', request.headers.get('content-type') || 'application/json')

    let body: string | undefined
    if (request.method === 'POST') {
      body = await request.text()
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    // Forward the response
    const responseData = await response.json()

    // Add demo-specific metadata
    if (responseData.meta) {
      responseData.meta.request_id = requestId
      responseData.meta.processing_ms = Date.now() - startTime
      responseData.meta.remaining_credits = rateLimitResult.remaining
    }

    return NextResponse.json(responseData, { status: response.status })

  } catch (error) {
    console.error('Demo proxy error:', error)
    return errorResponse(
      'INTERNAL_ERROR',
      'Demo service error',
      500,
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime
      }
    )
  }
}