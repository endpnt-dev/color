import Link from 'next/link'
import { Palette, Zap, Eye, Target, Shuffle, ArrowRight, Code, Github, Sparkles, PaintBucket, Pipette, ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import CodeBlock from './components/CodeBlock'
import Header from './components/Header'
import Footer from './components/Footer'

// Import ColorDemo with no SSR to avoid hydration issues
const ColorDemo = dynamic(() => import('./components/ColorDemo'), { ssr: false })

const features = [
  {
    icon: Palette,
    title: 'Format conversion',
    description: 'Convert between hex, RGB, HSL, HWB, LAB, LCH, OKLCH, and 50+ other color formats'
  },
  {
    icon: Eye,
    title: 'Contrast checking',
    description: 'WCAG 2.1 and APCA contrast analysis with accessibility recommendations'
  },
  {
    icon: Shuffle,
    title: 'Color harmony',
    description: 'Generate complementary, triadic, analogous, and split-complementary color schemes'
  },
  {
    icon: PaintBucket,
    title: 'Color manipulation',
    description: 'Create tints, shades, tones, and adjust saturation, lightness, and hue'
  },
  {
    icon: Pipette,
    title: 'Palette extraction',
    description: 'Extract dominant colors from any image with k-means clustering algorithm'
  },
  {
    icon: ImageIcon,
    title: 'Accessibility simulation',
    description: 'Simulate how colors appear to users with different types of color blindness'
  }
]

const codeExamples = {
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

const result = await response.json();
if (result.success) {
  console.log(result.data.oklch); // "oklch(0.7021 0.2641 320.89)"
}`,

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

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result["success"]:
    print(result["data"]["oklch"])  # "oklch(0.7021 0.2641 320.89)"`
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-rainbow-gradient bg-clip-text text-transparent">
                  Powerful color manipulation
                </span>
                <br />
                <span className="text-primary-600">with one API call</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Convert formats, extract palettes, analyze contrast, generate harmonies, and simulate color blindness.
                Perfect for design tools, accessibility checking, and creative automation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Code className="h-4 w-4" />
                View docs
              </Link>
            </div>

            {/* Quick example */}
            <div className="max-w-2xl mx-auto">
              <CodeBlock
                code={codeExamples.curl}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Try it live</h2>
            <p className="text-muted-foreground text-lg">
              Interactive color analysis powered by demo endpoints
            </p>
          </div>

          <ColorDemo />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need for color operations</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with modern color science and optimized for accuracy, performance, and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary-600/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Palette Feature Highlight */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h2 className="text-3xl font-bold">Advanced Palette Extraction</h2>
              <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                STARTER+
              </span>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Extract dominant colors from any image using sophisticated k-means clustering.
              Perfect for building design systems, analyzing brand colors, or creating themed interfaces.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-lg border border-border p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary-600" />
                      <span>K-means clustering algorithm</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary-600" />
                      <span>Optimized image preprocessing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-primary-600" />
                      <span>2-16 color extraction range</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-primary-600" />
                      <span>Supports PNG, JPEG, WebP, GIF</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <CodeBlock
                    code={`curl -X POST https://color.endpnt.dev/api/v1/palette \\
  -H "x-api-key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "colors": 6,
    "format": "hex"
  }'`}
                    language="bash"
                  />
                  <p className="text-sm text-muted-foreground">
                    Requires Starter tier or higher
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Easy integration</h2>
            <p className="text-muted-foreground text-lg">
              Works with any programming language that can make HTTP requests
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">JavaScript</h3>
                <CodeBlock
                  code={codeExamples.javascript}
                  language="javascript"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Python</h3>
                <CodeBlock
                  code={codeExamples.python}
                  language="python"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to start building with colors?</h2>
            <p className="text-muted-foreground text-lg">
              Join developers and designers using our Color API for accessibility tools, design systems, and creative applications.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              Get your free API key
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}