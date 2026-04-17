import { NextRequest } from 'next/server'
import { demoProxy } from '@/lib/demo-proxy'

export async function POST(request: NextRequest) {
  return demoProxy(request, {
    endpoint: '/name',
    allowedMethods: ['POST']
  })
}

export async function GET(request: NextRequest) {
  return demoProxy(request, {
    endpoint: '/name',
    allowedMethods: ['GET', 'POST']
  })
}