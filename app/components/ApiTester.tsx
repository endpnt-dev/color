'use client'

import { useState } from 'react'
import { Play, Loader2, Key } from 'lucide-react'
import CodeBlock from './CodeBlock'

interface ApiResponse {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
  }
  meta: {
    request_id: string
    processing_ms: number
    remaining_credits?: number
  }
}

interface ApiTesterProps {
  endpoint: string
  method: 'GET' | 'POST'
  title: string
  description: string
  defaultParams: Record<string, any>
  paramConfig: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'select' | 'color' | 'file'
    options?: string[]
    placeholder?: string
    required?: boolean
  }>
  examples: {
    curl: string
    javascript: string
    python: string
    nodejs?: string
  }
}

export default function ApiTester({
  endpoint,
  method,
  title,
  description,
  defaultParams,
  paramConfig,
  examples
}: ApiTesterProps) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [params, setParams] = useState(defaultParams)
  const [apiKey, setApiKey] = useState('')
  const [activeTab, setActiveTab] = useState('curl')

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setResponse({
        success: false,
        error: { code: 'MISSING_API_KEY', message: 'Please provide your API key' },
        meta: { request_id: '', processing_ms: 0 }
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const url = `https://color.endpnt.dev/api/v1${endpoint}`
      const headers: Record<string, string> = {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }

      const requestOptions: RequestInit = {
        method,
        headers
      }

      if (method === 'POST') {
        requestOptions.body = JSON.stringify(params)
      }

      const res = await fetch(url, requestOptions)
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({
        success: false,
        error: { code: 'REQUEST_FAILED', message: 'Failed to make request' },
        meta: { request_id: '', processing_ms: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const updateParam = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'curl', label: 'cURL', code: examples.curl },
    { id: 'javascript', label: 'JavaScript', code: examples.javascript },
    { id: 'python', label: 'Python', code: examples.python },
    ...(examples.nodejs ? [{ id: 'nodejs', label: 'Node.js', code: examples.nodejs }] : [])
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${
            method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {method}
          </span>
          <span className="ml-2 font-mono text-sm">/api/v1{endpoint}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium">Try it out</h4>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from the{' '}
              <a href="/pricing" className="text-primary-600 hover:underline">
                pricing page
              </a>
            </p>
          </div>

          {/* Parameter Inputs */}
          {paramConfig.map((config) => (
            <div key={config.key} className="space-y-2">
              <label className="text-sm font-medium">
                {config.label}
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {config.type === 'text' && (
                <input
                  type="text"
                  value={params[config.key] || ''}
                  onChange={(e) => updateParam(config.key, e.target.value)}
                  placeholder={config.placeholder}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              )}

              {config.type === 'number' && (
                <input
                  type="number"
                  value={params[config.key] || ''}
                  onChange={(e) => updateParam(config.key, parseFloat(e.target.value) || '')}
                  placeholder={config.placeholder}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              )}

              {config.type === 'color' && (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={params[config.key] || '#000000'}
                    onChange={(e) => updateParam(config.key, e.target.value)}
                    className="w-12 h-10 border border-border rounded-md"
                  />
                  <input
                    type="text"
                    value={params[config.key] || ''}
                    onChange={(e) => updateParam(config.key, e.target.value)}
                    placeholder={config.placeholder}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
              )}

              {config.type === 'select' && (
                <select
                  value={params[config.key] || ''}
                  onChange={(e) => updateParam(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {config.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Test API
              </>
            )}
          </button>
        </div>

        {/* Right: Response */}
        <div className="space-y-4">
          <h4 className="font-medium">Response</h4>

          {response ? (
            <div className="space-y-4">
              <div className={`p-3 rounded-md ${
                response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`text-sm font-medium ${
                  response.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {response.success ? 'Success' : 'Error'}
                </div>
                {response.error && (
                  <div className="text-red-700 text-sm mt-1">
                    {response.error.message}
                  </div>
                )}
              </div>

              <CodeBlock
                code={JSON.stringify(response, null, 2)}
                language="json"
              />
            </div>
          ) : (
            <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
              Fill in the parameters and click "Test API" to see the response
            </div>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h4 className="font-medium">Code Examples</h4>

        <div className="border-b border-border">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {tabs.map((tab) => (
          activeTab === tab.id && (
            <CodeBlock
              key={tab.id}
              code={tab.code.replace('your_api_key', apiKey || 'your_api_key')}
              language={tab.id === 'curl' ? 'bash' : tab.id === 'nodejs' ? 'javascript' : tab.id}
            />
          )
        ))}
      </div>
    </div>
  )
}