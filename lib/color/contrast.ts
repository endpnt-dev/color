import { parseColor } from './parse'
import { WCAG_THRESHOLDS } from '../config'
import { ColorApiError } from '../errors'

export interface ContrastRequest {
  foreground: string
  background: string
}

export interface ContrastResponse {
  foreground: string
  background: string
  contrast_ratio: number
  wcag: {
    AA_normal: boolean
    AA_large: boolean
    AAA_normal: boolean
    AAA_large: boolean
  }
  rating: 'excellent' | 'good' | 'poor' | 'fail'
}

export function calculateContrast(request: ContrastRequest): ContrastResponse {
  try {
    // Parse both colors
    const foregroundColor = parseColor(request.foreground)
    const backgroundColorColor = parseColor(request.background)

    // Calculate contrast ratio using WCAG formula
    // The contrast() method should be available from the a11y plugin
    if (typeof foregroundColor.contrast !== 'function') {
      throw new ColorApiError('INTERNAL_ERROR', 'Contrast calculation not available')
    }

    const contrastRatio = foregroundColor.contrast(backgroundColorColor)

    // Check WCAG compliance levels
    const wcag = {
      AA_normal: contrastRatio >= WCAG_THRESHOLDS.AA_NORMAL,
      AA_large: contrastRatio >= WCAG_THRESHOLDS.AA_LARGE,
      AAA_normal: contrastRatio >= WCAG_THRESHOLDS.AAA_NORMAL,
      AAA_large: contrastRatio >= WCAG_THRESHOLDS.AAA_LARGE,
    }

    // Determine rating
    let rating: ContrastResponse['rating']
    if (contrastRatio >= WCAG_THRESHOLDS.AAA_NORMAL) {
      rating = 'excellent'
    } else if (contrastRatio >= WCAG_THRESHOLDS.AA_NORMAL) {
      rating = 'good'
    } else if (contrastRatio >= WCAG_THRESHOLDS.AA_LARGE) {
      rating = 'poor'
    } else {
      rating = 'fail'
    }

    return {
      foreground: request.foreground,
      background: request.background,
      contrast_ratio: Math.round(contrastRatio * 100) / 100,
      wcag,
      rating
    }
  } catch (error) {
    if (error instanceof ColorApiError) {
      throw error
    }
    throw new ColorApiError('INTERNAL_ERROR', `Contrast calculation failed: ${error}`)
  }
}