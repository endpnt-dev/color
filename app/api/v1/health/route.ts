import { NextRequest } from 'next/server'
import { successResponse, generateRequestId } from '@/lib/response'
import { API_VERSION } from '@/lib/config'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    return successResponse(
      {
        status: 'ok',
        version: API_VERSION,
      },
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime,
      }
    )
  } catch (error) {
    console.error('Health check error:', error)
    return successResponse(
      {
        status: 'error',
        version: API_VERSION,
      },
      {
        request_id: requestId,
        processing_ms: Date.now() - startTime,
      },
      503
    )
  }
}