import Header from '../components/Header'
import Footer from '../components/Footer'
import ApiTester from '../components/ApiTester'
import { ArrowLeft, Palette, Eye, Shuffle, PaintBucket, Pipette, ImageIcon, Accessibility } from 'lucide-react'
import Link from 'next/link'

const apiEndpoints = [
  {
    endpoint: '/convert',
    method: 'POST' as const,
    title: 'Format Conversion',
    description: 'Convert colors between different formats (hex, rgb, hsl, hwb, lab, lch, oklch, etc.)',
    defaultParams: {
      color: '#D946EF',
      to: 'oklch'
    },
    paramConfig: [
      {
        key: 'color',
        label: 'Color',
        type: 'text' as const,
        placeholder: '#D946EF, rgb(217, 70, 239), hsl(320, 85%, 61%)',
        required: true
      },
      {
        key: 'to',
        label: 'Target Format',
        type: 'select' as const,
        options: ['hex', 'rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklch', 'oklab', 'xyz', 'all'],
        required: true
      }
    ],
    examples: {
      curl: `curl -X POST https://color.endpnt.dev/api/v1/convert \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "color": "#D946EF",
    "to": "oklch"
  }'`,
      javascript: `const response = await fetch('https://color.endpnt.dev/api/v1/convert', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    color: '#D946EF',
    to: 'oklch'
  })
});

const result = await response.json();`,
      python: `import requests

url = "https://color.endpnt.dev/api/v1/convert"
headers = {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "color": "#D946EF",
    "to": "oklch"
}

response = requests.post(url, headers=headers, json=data)`
    }
  },
  {
    endpoint: '/contrast',
    method: 'POST' as const,
    title: 'Contrast Analysis',
    description: 'Analyze color contrast using WCAG 2.1 and APCA algorithms for accessibility compliance',
    defaultParams: {
      foreground: '#D946EF',
      background: '#ffffff',
      algorithm: 'both'
    },
    paramConfig: [
      {
        key: 'foreground',
        label: 'Foreground Color',
        type: 'color' as const,
        placeholder: '#D946EF',
        required: true
      },
      {
        key: 'background',
        label: 'Background Color',
        type: 'color' as const,
        placeholder: '#ffffff',
        required: true
      },
      {
        key: 'algorithm',
        label: 'Algorithm',
        type: 'select' as const,
        options: ['wcag', 'apca', 'both']
      }
    ],
    examples: {
      curl: `curl -X POST https://color.endpnt.dev/api/v1/contrast \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "foreground": "#D946EF",
    "background": "#ffffff",
    "algorithm": "both"
  }'`,
      javascript: `const response = await fetch('https://color.endpnt.dev/api/v1/contrast', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    foreground: '#D946EF',
    background: '#ffffff',
    algorithm: 'both'
  })
});

const result = await response.json();`,
      python: `import requests

url = "https://color.endpnt.dev/api/v1/contrast"
headers = {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "foreground": "#D946EF",
    "background": "#ffffff",
    "algorithm": "both"
}

response = requests.post(url, headers=headers, json=data)`
    }
  },
  {
    endpoint: '/harmony',
    method: 'POST' as const,
    title: 'Color Harmony',
    description: 'Generate complementary, triadic, analogous, and other color harmony schemes',
    defaultParams: {
      color: '#D946EF',
      type: 'complementary'
    },
    paramConfig: [
      {
        key: 'color',
        label: 'Base Color',
        type: 'color' as const,
        placeholder: '#D946EF',
        required: true
      },
      {
        key: 'type',
        label: 'Harmony Type',
        type: 'select' as const,
        options: ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'square'],
        required: true
      },
      {
        key: 'format',
        label: 'Output Format',
        type: 'select' as const,
        options: ['hex', 'rgb', 'hsl', 'oklch']
      }
    ],
    examples: {
      curl: `curl -X POST https://color.endpnt.dev/api/v1/harmony \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "color": "#D946EF",
    "type": "complementary"
  }'`,
      javascript: `const response = await fetch('https://color.endpnt.dev/api/v1/harmony', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    color: '#D946EF',
    type: 'complementary'
  })
});

const result = await response.json();`,
      python: `import requests

url = "https://color.endpnt.dev/api/v1/harmony"
headers = {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "color": "#D946EF",
    "type": "complementary"
}

response = requests.post(url, headers=headers, json=data)`
    }
  },
  {
    endpoint: '/palette',
    method: 'POST' as const,
    title: 'Palette Extraction',
    description: 'Extract dominant colors from images using k-means clustering (Starter+ required)',
    defaultParams: {
      image_url: 'https://picsum.photos/300/200',
      colors: 6,
      format: 'hex'
    },
    paramConfig: [
      {
        key: 'image_url',
        label: 'Image URL',
        type: 'text' as const,
        placeholder: 'https://example.com/image.jpg',
        required: true
      },
      {
        key: 'colors',
        label: 'Number of Colors',
        type: 'number' as const,
        placeholder: '6'
      },
      {
        key: 'format',
        label: 'Output Format',
        type: 'select' as const,
        options: ['hex', 'rgb', 'hsl', 'oklch']
      }
    ],
    examples: {
      curl: `curl -X POST https://color.endpnt.dev/api/v1/palette \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "colors": 6,
    "format": "hex"
  }'`,
      javascript: `const response = await fetch('https://color.endpnt.dev/api/v1/palette', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    colors: 6,
    format: 'hex'
  })
});

const result = await response.json();`,
      python: `import requests

url = "https://color.endpnt.dev/api/v1/palette"
headers = {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "image_url": "https://example.com/image.jpg",
    "colors": 6,
    "format": "hex"
}

response = requests.post(url, headers=headers, json=data)`
    }
  },
  {
    endpoint: '/blindness',
    method: 'POST' as const,
    title: 'Color Blindness Simulation',
    description: 'Simulate how colors appear to users with different types of color blindness',
    defaultParams: {
      color: '#D946EF',
      type: 'protanopia'
    },
    paramConfig: [
      {
        key: 'color',
        label: 'Color',
        type: 'color' as const,
        placeholder: '#D946EF',
        required: true
      },
      {
        key: 'type',
        label: 'Blindness Type',
        type: 'select' as const,
        options: ['protanopia', 'deuteranopia', 'tritanopia', 'protanomaly', 'deuteranomaly', 'tritanomaly', 'achromatopsia', 'achromatomaly'],
        required: true
      }
    ],
    examples: {
      curl: `curl -X POST https://color.endpnt.dev/api/v1/blindness \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "color": "#D946EF",
    "type": "protanopia"
  }'`,
      javascript: `const response = await fetch('https://color.endpnt.dev/api/v1/blindness', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    color: '#D946EF',
    type: 'protanopia'
  })
});

const result = await response.json();`,
      python: `import requests

url = "https://color.endpnt.dev/api/v1/blindness"
headers = {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "color": "#D946EF",
    "type": "protanopia"
}

response = requests.post(url, headers=headers, json=data)`
    }
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Complete reference for the Color API. Test endpoints interactively with your API key,
            view code examples, and understand response formats.
          </p>
        </div>

        {/* Quick Start */}
        <div className="mb-16 bg-muted/30 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Base URL</h3>
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                https://color.endpnt.dev/api/v1
              </code>
            </div>
            <div>
              <h3 className="font-medium mb-2">Authentication</h3>
              <p className="text-muted-foreground">
                Include your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header.
                Get your API key from the <Link href="/pricing" className="text-primary-600 hover:underline">pricing page</Link>.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Response Format</h3>
              <p className="text-muted-foreground">
                All endpoints return JSON with a consistent structure including <code className="bg-muted px-1 rounded">success</code>,
                <code className="bg-muted px-1 rounded">data</code>, and <code className="bg-muted px-1 rounded">meta</code> fields.
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-16">
          {apiEndpoints.map((endpoint) => (
            <div key={endpoint.endpoint} className="border-t border-border pt-16 first:border-t-0 first:pt-0">
              <ApiTester {...endpoint} />
            </div>
          ))}
        </div>

        {/* Error Codes */}
        <div className="mt-16 border-t border-border pt-16">
          <h2 className="text-2xl font-semibold mb-8">Error Codes</h2>
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">Client Errors (4xx)</h3>
                <div className="space-y-1 text-muted-foreground">
                  <div><code>INVALID_COLOR_FORMAT</code> - Invalid color format</div>
                  <div><code>MISSING_REQUIRED_FIELD</code> - Required parameter missing</div>
                  <div><code>UNSUPPORTED_OPERATION</code> - Unsupported operation</div>
                  <div><code>FILE_TOO_LARGE</code> - Image file too large</div>
                  <div><code>RATE_LIMITED</code> - Rate limit exceeded</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Server Errors (5xx)</h3>
                <div className="space-y-1 text-muted-foreground">
                  <div><code>PROCESSING_ERROR</code> - Error processing request</div>
                  <div><code>SERVICE_UNAVAILABLE</code> - Service temporarily unavailable</div>
                  <div><code>PALETTE_EXTRACTION_FAILED</code> - Image processing failed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="mt-16 border-t border-border pt-16">
          <h2 className="text-2xl font-semibold mb-8">Rate Limits</h2>
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-medium mb-2">Free Tier</h3>
                <div className="text-2xl font-bold text-muted-foreground">100</div>
                <div className="text-sm text-muted-foreground">requests/month</div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Starter</h3>
                <div className="text-2xl font-bold text-primary-600">10K</div>
                <div className="text-sm text-muted-foreground">requests/month</div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Pro</h3>
                <div className="text-2xl font-bold text-primary-600">100K</div>
                <div className="text-sm text-muted-foreground">requests/month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}