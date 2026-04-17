import { parseColor, formatColorOutput } from './parse'
import { ColorApiError } from '../errors'

export interface VariantsRequest {
  input: string
  count?: number
  intensity?: number
}

export interface VariantsResponse {
  input: string
  operation: 'tint' | 'shade' | 'tone'
  variants: string[]
}

export function generateTints(request: VariantsRequest): VariantsResponse {
  return generateVariants(request, 'tint')
}

export function generateShades(request: VariantsRequest): VariantsResponse {
  return generateVariants(request, 'shade')
}

export function generateTones(request: VariantsRequest): VariantsResponse {
  return generateVariants(request, 'tone')
}

function generateVariants(
  request: VariantsRequest,
  operation: 'tint' | 'shade' | 'tone'
): VariantsResponse {
  try {
    const color = parseColor(request.input)
    const count = request.count || 5
    const intensity = request.intensity || 0.1

    const variants: string[] = []

    // Add the original color as the first variant
    variants.push(formatColorOutput(color, 'hex') as string)

    // Generate variants
    for (let i = 1; i < count; i++) {
      const amount = intensity * i
      let variantColor

      switch (operation) {
        case 'tint':
          // Mix with white
          if (typeof color.mix !== 'function') {
            throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
          }
          variantColor = color.mix('white', amount)
          break

        case 'shade':
          // Mix with black
          if (typeof color.mix !== 'function') {
            throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
          }
          variantColor = color.mix('black', amount)
          break

        case 'tone':
          // Mix with gray (50% black and white)
          if (typeof color.mix !== 'function') {
            throw new ColorApiError('INTERNAL_ERROR', 'Color mixing not available')
          }
          variantColor = color.mix('#808080', amount)
          break

        default:
          throw new ColorApiError('UNSUPPORTED_OPERATION', `Unsupported operation: ${operation}`)
      }

      variants.push(formatColorOutput(variantColor, 'hex') as string)
    }

    return {
      input: request.input,
      operation,
      variants
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `${operation} generation failed: ${error}`)
  }
}