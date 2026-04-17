import { parseColor } from './parse'
import { ColorApiError } from '../errors'
import namedColors from '../color-data/named-colors.json'

export interface NameRequest {
  input: string
}

export interface NameResponse {
  input: string
  exact_match: boolean
  name: string
  distance: number
  css: boolean
}

export function findColorName(request: NameRequest): NameResponse {
  try {
    const inputColor = parseColor(request.input)
    const inputHex = inputColor.toHex().toLowerCase()

    // Check for exact match first
    for (const [name, hex] of Object.entries(namedColors.css)) {
      if (hex.toLowerCase() === inputHex) {
        return {
          input: request.input,
          exact_match: true,
          name: name,
          distance: 0,
          css: true
        }
      }
    }

    for (const [name, hex] of Object.entries(namedColors.extended)) {
      if (hex.toLowerCase() === inputHex) {
        return {
          input: request.input,
          exact_match: true,
          name: name,
          distance: 0,
          css: false
        }
      }
    }

    // No exact match, find closest color using Delta-E (simplified Euclidean distance in RGB space)
    const inputRgb = inputColor.toRgb()
    let closestName = ''
    let closestDistance = Infinity
    let isCss = false

    // Check CSS colors
    for (const [name, hex] of Object.entries(namedColors.css)) {
      const namedColor = parseColor(hex)
      const namedRgb = namedColor.toRgb()
      const distance = calculateRgbDistance(inputRgb, namedRgb)

      if (distance < closestDistance) {
        closestDistance = distance
        closestName = name
        isCss = true
      }
    }

    // Check extended colors
    for (const [name, hex] of Object.entries(namedColors.extended)) {
      const namedColor = parseColor(hex)
      const namedRgb = namedColor.toRgb()
      const distance = calculateRgbDistance(inputRgb, namedRgb)

      if (distance < closestDistance) {
        closestDistance = distance
        closestName = name
        isCss = false
      }
    }

    // Normalize distance to 0-100 scale
    const normalizedDistance = Math.min(100, Math.round(closestDistance / 4.41)) // sqrt(255^2 * 3) ≈ 441

    return {
      input: request.input,
      exact_match: false,
      name: closestName,
      distance: normalizedDistance,
      css: isCss
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Color name lookup failed: ${error}`)
  }
}

function calculateRgbDistance(rgb1: any, rgb2: any): number {
  const deltaR = rgb1.r - rgb2.r
  const deltaG = rgb1.g - rgb2.g
  const deltaB = rgb1.b - rgb2.b

  return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB)
}