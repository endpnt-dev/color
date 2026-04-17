import { ErrorCode } from './config'

export class ColorApiError extends Error {
  public code: ErrorCode
  public statusCode: number

  constructor(code: ErrorCode, message: string, statusCode: number = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'ColorApiError'
  }
}

export function validateInput(input: any, field: string, maxLength: number): string {
  if (!input) {
    throw new ColorApiError('PARSE_ERROR', `Missing required field: ${field}`)
  }

  const value = String(input).trim()

  if (value.length > maxLength) {
    throw new ColorApiError(
      'INVALID_COLOR_FORMAT',
      `${field} exceeds maximum length of ${maxLength} characters`
    )
  }

  return value
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  field: string
): number {
  if (isNaN(value) || value < min || value > max) {
    throw new ColorApiError(
      'PARSE_ERROR',
      `${field} must be between ${min} and ${max}, got ${value}`
    )
  }
  return value
}

export function validateEnum<T extends string>(
  value: string,
  validValues: readonly T[],
  field: string
): T {
  if (!validValues.includes(value as T)) {
    throw new ColorApiError(
      'UNSUPPORTED_OPERATION',
      `Invalid ${field}: ${value}. Must be one of: ${validValues.join(', ')}`
    )
  }
  return value as T
}