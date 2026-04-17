import { colord } from './colord-setup'
import { ColorApiError } from '../errors'
import { ColorFormat } from '../config'

export function parseColor(input: string): any {
  const trimmed = input.trim()

  if (!trimmed) {
    throw new ColorApiError('INVALID_COLOR_FORMAT', 'Color input cannot be empty')
  }

  const parsed = colord(trimmed)

  if (!parsed.isValid()) {
    throw new ColorApiError('INVALID_COLOR_FORMAT', `Invalid color format: ${input}`)
  }

  return parsed
}

export function detectColorFormat(input: string): ColorFormat {
  const trimmed = input.trim()

  // Hex format
  if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return 'hex'
  }

  // RGB/RGBA format
  if (/^rgba?/i.test(trimmed)) {
    return 'rgb'
  }

  // HSL/HSLA format
  if (/^hsla?/i.test(trimmed)) {
    return 'hsl'
  }

  // HSV/HSVA format
  if (/^hsva?/i.test(trimmed)) {
    return 'hsv'
  }

  // CMYK format
  if (/^cmyk/i.test(trimmed)) {
    return 'cmyk'
  }

  // LAB format
  if (/^lab/i.test(trimmed)) {
    return 'lab'
  }

  // Try to parse with colord and see what format it recognizes
  const parsed = colord(trimmed)
  if (parsed.isValid()) {
    // If it's a named color, return hex as the detected format
    return 'hex'
  }

  throw new ColorApiError('INVALID_COLOR_FORMAT', `Could not detect color format: ${input}`)
}

export function formatColorOutput(color: any, format: ColorFormat): string | object {
  try {
    switch (format) {
      case 'hex':
        return color.toHex()

      case 'rgb':
        return color.toRgbString()

      case 'hsl':
        return color.toHslString()

      case 'hsv':
        return color.toHsvString()

      case 'cmyk':
        // Check if cmyk plugin is available
        if (typeof color.toCmyk === 'function') {
          const cmyk = color.toCmyk()
          return `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`
        } else {
          throw new ColorApiError('UNSUPPORTED_OPERATION', 'CMYK format not supported')
        }

      case 'lab':
        // Check if lab plugin is available
        if (typeof color.toLab === 'function') {
          const lab = color.toLab()
          return `lab(${lab.l.toFixed(1)}, ${lab.a.toFixed(1)}, ${lab.b.toFixed(1)})`
        } else {
          throw new ColorApiError('UNSUPPORTED_OPERATION', 'LAB format not supported')
        }

      default:
        throw new ColorApiError('UNSUPPORTED_OPERATION', `Unsupported format: ${format}`)
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('OUT_OF_GAMUT', `Color conversion to ${format} failed: ${error}`)
  }
}