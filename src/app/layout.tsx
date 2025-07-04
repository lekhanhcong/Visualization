import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
