import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Color API - Powerful color manipulation and analysis with one API call',
  description: 'Fast, reliable color API with format conversion, palette extraction, contrast checking, color harmony generation, and accessibility features. Perfect for design automation.',
  keywords: ['color api', 'color conversion', 'palette extraction', 'contrast checker', 'color harmony', 'accessibility', 'design automation'],
  authors: [{ name: 'endpnt.dev' }],
  openGraph: {
    title: 'Color API - Powerful color manipulation and analysis with one API call',
    description: 'Fast, reliable color API with format conversion, palette extraction, contrast checking, and color harmony generation.',
    url: 'https://color.endpnt.dev',
    siteName: 'Color API',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color API - Powerful color manipulation and analysis with one API call',
    description: 'Fast, reliable color API with format conversion, palette extraction, contrast checking, and color harmony generation.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}