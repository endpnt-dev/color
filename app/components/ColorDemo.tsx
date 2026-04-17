'use client'

import { useState, useEffect, useMemo } from 'react'
import { Palette, Zap, Eye } from 'lucide-react'
import ColorSwatch from './ColorSwatch'

interface ConversionResult {
  hex: string
  rgb: string
  hsl: string
  hwb: string
  lab: string
  lch: string
  oklch: string
}

interface ContrastResult {
  wcag_ratio: number
  wcag_level: string
  apca_score: number
  apca_level: string
  readable: boolean
}

interface HarmonyResult {
  colors: string[]
  type: string
}

const defaultColor = '#D946EF'

export default function ColorDemo() {
  const [inputColor, setInputColor] = useState(defaultColor)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(null)
  const [harmonyResult, setHarmonyResult] = useState<HarmonyResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Debounced color value
  const debouncedColor = useMemo(() => {
    const timer = setTimeout(() => inputColor, 500)
    return () => clearTimeout(timer)
  }, [inputColor])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputColor && inputColor !== '') {
        fetchColorData(inputColor)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [inputColor])

  const fetchColorData = async (color: string) => {
    if (!color) return

    setLoading(true)
    try {
      // Fetch conversion data
      const conversionResponse = await fetch('/api/demo/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, to: 'all' })
      })

      if (conversionResponse.ok) {
        const conversionData = await conversionResponse.json()
        if (conversionData.success) {
          setConversionResult(conversionData.data)
        }
      }

      // Fetch contrast data (against white background)
      const contrastResponse = await fetch('/api/demo/contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foreground: color,
          background: '#ffffff',
          algorithm: 'both'
        })
      })

      if (contrastResponse.ok) {
        const contrastData = await contrastResponse.json()
        if (contrastData.success) {
          setContrastResult(contrastData.data)
        }
      }

      // Fetch harmony data
      const harmonyResponse = await fetch('/api/demo/harmony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, type: 'complementary' })
      })

      if (harmonyResponse.ok) {
        const harmonyData = await harmonyResponse.json()
        if (harmonyData.success) {
          setHarmonyResult(harmonyData.data)
        }
      }

    } catch (error) {
      console.error('Error fetching color data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Color Input */}
      <div className="text-center mb-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
                placeholder="Enter color (hex, rgb, hsl...)"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Try colors like #ff6b35, rgb(255, 107, 53), or hsl(15, 100%, 60%)
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 animate-pulse" />
            Analyzing color...
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Format Conversions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Format Conversion</h3>
          </div>

          {conversionResult ? (
            <div className="space-y-3">
              <ColorSwatch
                color={conversionResult.hex}
                label="HEX"
                format={conversionResult.hex}
                size="sm"
              />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RGB:</span>
                  <span className="font-mono">{conversionResult.rgb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HSL:</span>
                  <span className="font-mono">{conversionResult.hsl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LAB:</span>
                  <span className="font-mono">{conversionResult.lab}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OKLCH:</span>
                  <span className="font-mono">{conversionResult.oklch}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
              Enter a color to see format conversions
            </div>
          )}
        </div>

        {/* Contrast Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Contrast Analysis</h3>
          </div>

          {contrastResult ? (
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border"
                style={{ backgroundColor: '#ffffff', color: inputColor }}
              >
                <p className="font-medium">Sample text on white</p>
                <p className="text-sm">How readable is this color combination?</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WCAG Ratio:</span>
                  <span className="font-mono">{contrastResult.wcag_ratio.toFixed(2)}:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WCAG Level:</span>
                  <span className={`font-mono ${
                    contrastResult.wcag_level === 'AAA' ? 'text-green-600' :
                    contrastResult.wcag_level === 'AA' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {contrastResult.wcag_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">APCA Score:</span>
                  <span className="font-mono">{contrastResult.apca_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Readable:</span>
                  <span className={`font-medium ${contrastResult.readable ? 'text-green-600' : 'text-red-600'}`}>
                    {contrastResult.readable ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
              Enter a color to see contrast analysis
            </div>
          )}
        </div>

        {/* Color Harmony */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Color Harmony</h3>
          </div>

          {harmonyResult ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                {harmonyResult.type} harmony
              </div>
              <div className="grid grid-cols-2 gap-3">
                {harmonyResult.colors.map((color, index) => (
                  <ColorSwatch
                    key={index}
                    color={color}
                    label={`Color ${index + 1}`}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
              Enter a color to see harmony suggestions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}