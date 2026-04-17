import { parseColor, formatColorOutput } from './parse'
import { HarmonyType, HarmonyFormat } from '../config'
import { ColorApiError } from '../errors'

export interface HarmonyRequest {
  input: string
  type: HarmonyType
  format?: HarmonyFormat
}

export interface HarmonyResponse {
  input: string
  type: HarmonyType
  palette: string[]
}

export function generateHarmony(request: HarmonyRequest): HarmonyResponse {
  try {
    const color = parseColor(request.input)
    const format = request.format || 'hex'
    const baseHsl = color.toHsl()
    const baseHue = baseHsl.h

    let hueOffsets: number[] = []

    switch (request.type) {
      case 'complementary':
        hueOffsets = [0, 180]
        break
      case 'triadic':
        hueOffsets = [0, 120, 240]
        break
      case 'analogous':
        hueOffsets = [0, -30, 30]
        break
      case 'split-complementary':
        hueOffsets = [0, 150, 210]
        break
      case 'tetradic':
        hueOffsets = [0, 60, 180, 240]
        break
      case 'square':
        hueOffsets = [0, 90, 180, 270]
        break
      default:
        throw new ColorApiError('UNSUPPORTED_HARMONY_TYPE', `Unsupported harmony type: ${request.type}`)
    }

    const palette: string[] = []

    for (const offset of hueOffsets) {
      const newHue = (baseHue + offset) % 360
      const harmonyColor = color.hue(newHue)
      const formattedColor = formatColorOutput(harmonyColor, format) as string
      palette.push(formattedColor)
    }

    return {
      input: request.input,
      type: request.type,
      palette
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Harmony generation failed: ${error}`)
  }
}