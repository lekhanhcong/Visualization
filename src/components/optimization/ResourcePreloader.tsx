/**
 * Resource Preloader - Optimizes loading of critical resources
 * Preloads images and other assets for better performance
 */

'use client'

import { useEffect } from 'react'

interface ResourcePreloaderProps {
  /** Critical images to preload */
  images?: string[]
  /** JavaScript chunks to prefetch */
  scripts?: string[]
  /** CSS files to preload */
  stylesheets?: string[]
}

export function ResourcePreloader({ 
  images = [], 
  scripts = [], 
  stylesheets = [] 
}: ResourcePreloaderProps) {
  useEffect(() => {
    // Preload critical images
    images.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })

    // Prefetch JavaScript chunks
    scripts.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'script'
      link.href = src
      document.head.appendChild(link)
    })

    // Preload CSS files
    stylesheets.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      document.head.appendChild(link)
    })

    // Preload the main power map image
    const powerMapImage = new Image()
    powerMapImage.src = '/images/power-map.png'
    
    // Prefetch potential redundancy feature chunks when user is likely to use it
    if (process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true') {
      // Wait 3 seconds then prefetch redundancy chunks
      const timer = setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = '/_next/static/chunks/redundancy-feature.js'
        document.head.appendChild(link)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [images, scripts, stylesheets])

  // This component doesn't render anything
  return null
}

// Default preloader with common resources
export function DefaultResourcePreloader() {
  return (
    <ResourcePreloader 
      images={[
        '/images/power-map.png', // Main power map
      ]}
    />
  )
}