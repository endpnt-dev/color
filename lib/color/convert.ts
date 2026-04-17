import { parseColor, formatColorOutput, detectColorFormat } from './parse'
import { ColorFormat } from '../config'
import { ColorApiError } from '../errors'

export interface ConvertRequest {
  input: string
  from?: ColorFormat
  to: ColorFormat | 'all'
}

export interface ConvertResponse {
  input: string
  from: ColorFormat
  to: ColorFormat | 'all'
  result: string | object
}

export function convertColor(request: ConvertRequest): ConvertResponse {
  try {
    // Parse the input color
    const color = parseColor(request.input)

    // Detect or validate the source format
    const fromFormat = request.from || detectColorFormat(request.input)

    if (request.to === 'all') {
      // Convert to all formats
      const result: Record<string, string> = {}

      const formats: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'lab']

      for (const format of formats) {
        try {
          result[format] = formatColorOutput(color, format) as string
        } catch (error) {
          // Skip formats that fail (e.g., out of gamut)
          console.warn(`Failed to convert to ${format}:`, error)
        }
      }

      return {
        input: request.input,
        from: fromFormat,
        to: 'all',
        result
      }
    } else {
      // Convert to specific format
      const result = formatColorOutput(color, request.to)

      return {
        input: request.input,
        from: fromFormat,
        to: request.to,
        result
      }
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Color conversion failed: ${error}`)
  }
}