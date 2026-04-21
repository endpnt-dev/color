import { NextRequest } from 'next/server'
import { demoProxy } from '@/lib/demo-proxy'
import { DEFAULT_ALLOWED_ORIGINS } from '@/lib/demo-config'

export async function POST(request: NextRequest) {
  return demoProxy(request, {
    endpoint: '/convert',
    allowedMethods: ['POST'],
    allowedOrigins: DEFAULT_ALLOWED_ORIGINS
  })
}