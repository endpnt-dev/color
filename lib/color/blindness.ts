import { simulate, type Deficiency } from '@bjornlu/colorblind'
import { parseColor, formatColorOutput } from './parse'
import { BlindnessType } from '../config'
import { ColorApiError } from '../errors'

export interface BlindnessRequest {
  input: string
  type: BlindnessType | 'all'
}

export interface BlindnessResponse {
  input: string
  type: BlindnessType | 'all'
  simulated: string | Record<BlindnessType, string>
}

export function simulateColorBlindness(request: BlindnessRequest): BlindnessResponse {
  try {
    const color = parseColor(request.input)
    const rgb = color.toRgb()

    // Convert to the format expected by @bjornlu/colorblind
    const rgbInput = { r: rgb.r, g: rgb.g, b: rgb.b }

    if (request.type === 'all') {
      const results: Record<BlindnessType, string> = {
        protanopia: '',
        deuteranopia: '',
        tritanopia: '',
        achromatopsia: '',
      }

      const types: BlindnessType[] = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

      for (const type of types) {
        const deficiency: Deficiency = type as Deficiency
        const simulatedRgb = simulate(rgbInput, deficiency)

        // Create a new color from the simulated RGB
        const simulatedColor = parseColor(`rgb(${simulatedRgb.r}, ${simulatedRgb.g}, ${simulatedRgb.b})`)
        results[type] = formatColorOutput(simulatedColor, 'hex') as string
      }

      return {
        input: request.input,
        type: 'all',
        simulated: results
      }
    } else {
      // Single type simulation
      const deficiency: Deficiency = request.type as Deficiency
      const simulatedRgb = simulate(rgbInput, deficiency)

      // Create a new color from the simulated RGB
      const simulatedColor = parseColor(`rgb(${simulatedRgb.r}, ${simulatedRgb.g}, ${simulatedRgb.b})`)
      const result = formatColorOutput(simulatedColor, 'hex') as string

      return {
        input: request.input,
        type: request.type,
        simulated: result
      }
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Color blindness simulation failed: ${error}`)
  }
}