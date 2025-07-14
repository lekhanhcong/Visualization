import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import PerformanceMonitorWrapper from '../components/PerformanceMonitorWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Proxima Nova alternative - Inter font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hue Hi Tech Park - 300MW AI Data Center Visualization',
  description:
    'Interactive visualization of the 300MW AI Data Center infrastructure at Hue Hi Tech Park, including power transmission lines, substations, and renewable energy sources.',
  keywords:
    'data center, AI, infrastructure, visualization, power transmission, Hue, Vietnam',
  authors: [{ name: 'Hue Hi Tech Park Development Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <PerformanceMonitorWrapper>
          {children}
        </PerformanceMonitorWrapper>
      </body>
    </html>
  )
}
