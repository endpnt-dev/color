'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ColorSwatchProps {
  color: string
  label?: string
  format?: string
  size?: 'sm' | 'md' | 'lg'
  showCopy?: boolean
  onClick?: () => void
}

export default function ColorSwatch({
  color,
  label,
  format,
  size = 'md',
  showCopy = true,
  onClick
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy color: ', err)
    }
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  const isValidColor = (colorString: string) => {
    // Basic validation for hex, rgb, hsl formats
    return /^#([0-9A-F]{3}){1,2}$/i.test(colorString) ||
           /^rgb\(/.test(colorString) ||
           /^hsl\(/.test(colorString) ||
           /^rgba\(/.test(colorString) ||
           /^hsla\(/.test(colorString)
  }

  const swatchColor = isValidColor(color) ? color : '#cccccc'

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`${sizeClasses[size]} color-swatch cursor-pointer relative group`}
        style={{ backgroundColor: swatchColor }}
        onClick={onClick || (showCopy ? copyToClipboard : undefined)}
      >
        {showCopy && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
            {copied ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Copy className="h-4 w-4 text-white" />
            )}
          </div>
        )}
      </div>

      {(label || format) && (
        <div className="text-center">
          {label && (
            <div className="text-sm font-medium text-foreground">{label}</div>
          )}
          {format && (
            <div className="text-xs font-mono text-muted-foreground">{format}</div>
          )}
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {color}
          </div>
        </div>
      )}
    </div>
  )
}