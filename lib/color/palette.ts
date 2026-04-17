import { parseColor, formatColorOutput } from './parse'
import { PaletteAlgorithm } from '../config'
import { ColorApiError } from '../errors'

export interface PaletteRequest {
  input: string
  count?: number
  algorithm?: PaletteAlgorithm
}

export interface PaletteResponse {
  input: string
  algorithm: PaletteAlgorithm
  palette: string[]
}

export function generatePalette(request: PaletteRequest): PaletteResponse {
  try {
    const color = parseColor(request.input)
    const count = request.count || 5
    const algorithm = request.algorithm || 'balanced'

    let palette: string[] = []

    switch (algorithm) {
      case 'tints':
        palette = generateTintsPalette(color, count)
        break
      case 'shades':
        palette = generateShadesPalette(color, count)
        break
      case 'tones':
        palette = generateTonesPalette(color, count)
        break
      case 'monochromatic':
        palette = generateMonochromaticPalette(color, count)
        break
      case 'balanced':
        palette = generateBalancedPalette(color, count)
        break
      default:
        throw new ColorApiError('UNSUPPORTED_OPERATION', `Unsupported algorithm: ${algorithm}`)
    }

    return {
      input: request.input,
      algorithm,
      palette
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Palette generation failed: ${error}`)
  }
}

function generateTintsPalette(color: any, count: number): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    const amount = i / (count - 1) // 0 to 1
    if (typeof color.mix !== 'function') {
      throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
    }
    const tint = color.mix('white', amount)
    palette.push(formatColorOutput(tint, 'hex') as string)
  }

  return palette
}

function generateShadesPalette(color: any, count: number): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    const amount = i / (count - 1) // 0 to 1
    if (typeof color.mix !== 'function') {
      throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
    }
    const shade = color.mix('black', amount)
    palette.push(formatColorOutput(shade, 'hex') as string)
  }

  return palette
}

function generateTonesPalette(color: any, count: number): string[] {
  const palette: string[] = []

  for (let i = 0; i < count; i++) {
    const amount = i / (count - 1) // 0 to 1
    if (typeof color.mix !== 'function') {
      throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
    }
    const tone = color.mix('#808080', amount)
    palette.push(formatColorOutput(tone, 'hex') as string)
  }

  return palette
}

function generateMonochromaticPalette(color: any, count: number): string[] {
  const palette: string[] = []
  const hsl = color.toHsl()

  for (let i = 0; i < count; i++) {
    // Vary saturation and lightness while keeping the same hue
    const saturationVariation = (i / (count - 1)) * 0.6 + 0.2 // 20% to 80%
    const lightnessVariation = (i / (count - 1)) * 0.6 + 0.2 // 20% to 80%

    const variant = color.hsl({
      h: hsl.h,
      s: saturationVariation * 100,
      l: lightnessVariation * 100
    })

    palette.push(formatColorOutput(variant, 'hex') as string)
  }

  return palette
}

function generateBalancedPalette(color: any, count: number): string[] {
  const palette: string[] = []
  const baseHsl = color.toHsl()

  // Start with the original color
  palette.push(formatColorOutput(color, 'hex') as string)

  // Generate complementary and triadic variations with lightness adjustments
  for (let i = 1; i < count; i++) {
    const step = i / (count - 1)

    // Rotate hue and adjust lightness/saturation for variety
    const hueOffset = step * 360 / count // Distribute around color wheel
    const lightnessAdjust = Math.sin(step * Math.PI) * 20 // Vary lightness
    const saturationAdjust = Math.cos(step * Math.PI) * 15 // Vary saturation

    const newHue = (baseHsl.h + hueOffset) % 360
    const newLightness = Math.max(10, Math.min(90, baseHsl.l + lightnessAdjust))
    const newSaturation = Math.max(10, Math.min(90, baseHsl.s + saturationAdjust))

    const variant = color.hsl({
      h: newHue,
      s: newSaturation,
      l: newLightness
    })

    palette.push(formatColorOutput(variant, 'hex') as string)
  }

  return palette
}