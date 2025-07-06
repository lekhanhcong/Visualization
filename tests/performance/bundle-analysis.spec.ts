/**
 * Bundle Analysis Tests for 2N+1 Redundancy Visualization
 * Testing bundle size, chunk optimization, and asset loading
 */

import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test.describe('Bundle Analysis Tests', () => {
  test('should have optimized bundle sizes', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Get all loaded scripts
    const scriptSizes = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      return Promise.all(
        scripts.map(async (script: any) => {
          try {
            const response = await fetch(script.src)
            const content = await response.text()
            return {
              src: script.src,
              size: new Blob([content]).size,
              isChunk: script.src.includes('/_next/static/chunks/'),
              isFramework: script.src.includes('framework') || script.src.includes('main'),
              isRedundancy: script.src.includes('redundancy') || content.includes('RedundancyVisualization')
            }
          } catch {
            return { src: script.src, size: 0, isChunk: false, isFramework: false, isRedundancy: false }
          }
        })
      )
    })
    
    // Total bundle size should be reasonable (less than 1MB for main bundles)
    const mainBundles = scriptSizes.filter(script => script.isFramework)
    const totalMainSize = mainBundles.reduce((sum, script) => sum + script.size, 0)
    expect(totalMainSize).toBeLessThan(1024 * 1024) // 1MB
    
    // Redundancy feature should be in separate chunk (code splitting)
    const redundancyChunks = scriptSizes.filter(script => script.isRedundancy)
    expect(redundancyChunks.length).toBeGreaterThan(0)
    
    // Individual chunks should not be too large
    scriptSizes.forEach(script => {
      if (script.isChunk && script.size > 0) {
        expect(script.size).toBeLessThan(500 * 1024) // 500KB per chunk
      }
    })
  })

  test('should load critical resources first', async ({ page }) => {
    const loadOrder: string[] = []
    
    // Track resource loading order
    page.on('response', response => {
      const url = response.url()
      if (url.includes('/_next/static/') || url.includes('.js') || url.includes('.css')) {
        loadOrder.push(url)
      }
    })
    
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Critical resources should load first
    const criticalResources = loadOrder.filter(url => 
      url.includes('framework') || 
      url.includes('main') || 
      url.includes('polyfills') ||
      url.includes('.css')
    )
    
    const redundancyResources = loadOrder.filter(url => 
      url.includes('redundancy') ||
      url.includes('framer-motion')
    )
    
    // Critical resources should load before redundancy-specific resources
    if (criticalResources.length > 0 && redundancyResources.length > 0) {
      const firstCriticalIndex = loadOrder.indexOf(criticalResources[0])
      const firstRedundancyIndex = loadOrder.indexOf(redundancyResources[0])
      expect(firstCriticalIndex).toBeLessThan(firstRedundancyIndex)
    }
  })

  test('should have efficient CSS loading', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Get CSS metrics
    const cssMetrics = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets)
      let totalRules = 0
      let unusedRules = 0
      
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          totalRules += rules.length
          
          // Check for unused rules (simplified heuristic)
          rules.forEach(rule => {
            if (rule.type === 1) { // CSSStyleRule
              const selectorText = (rule as CSSStyleRule).selectorText
              if (selectorText && !document.querySelector(selectorText)) {
                unusedRules++
              }
            }
          })
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
        }
      })
      
      return { totalRules, unusedRules, utilization: (totalRules - unusedRules) / totalRules }
    })
    
    // CSS utilization should be reasonable (at least 50%)
    if (cssMetrics.totalRules > 0) {
      expect(cssMetrics.utilization).toBeGreaterThan(0.5)
    }
  })

  test('should have proper image optimization', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Trigger redundancy feature to load any images
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    await page.waitForTimeout(2000)
    
    // Check image optimization
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.images)
      return images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.offsetWidth,
        displayHeight: img.offsetHeight,
        format: img.src.split('.').pop()?.toLowerCase(),
        isOptimized: img.src.includes('_next/image') || img.src.includes('webp') || img.src.includes('avif')
      }))
    })
    
    imageMetrics.forEach(image => {
      // Images should use modern formats when possible
      if (image.src.includes('_next/')) {
        expect(['webp', 'avif', 'png', 'jpg', 'jpeg']).toContain(image.format)
      }
      
      // Images should not be significantly oversized
      if (image.naturalWidth > 0 && image.displayWidth > 0) {
        const oversizeRatio = image.naturalWidth / image.displayWidth
        expect(oversizeRatio).toBeLessThan(2) // Not more than 2x oversized
      }
    })
  })

  test('should minimize render-blocking resources', async ({ page }) => {
    const renderBlockingResources: string[] = []
    
    // Track render-blocking resources
    page.on('response', response => {
      const url = response.url()
      const headers = response.headers()
      
      // CSS files are render-blocking by default
      if (url.endsWith('.css') || headers['content-type']?.includes('text/css')) {
        renderBlockingResources.push(url)
      }
    })
    
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Should have minimal render-blocking CSS
    expect(renderBlockingResources.length).toBeLessThan(5)
    
    // Check for critical CSS inlining
    const hasInlineCss = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('style'))
      return styles.some(style => style.textContent && style.textContent.length > 100)
    })
    
    // Should have some critical CSS inlined
    expect(hasInlineCss).toBe(true)
  })

  test('should use proper caching strategies', async ({ page }) => {
    const cacheHeaders: Record<string, string> = {}
    
    // Track cache headers
    page.on('response', response => {
      const url = response.url()
      const cacheControl = response.headers()['cache-control']
      if (cacheControl && url.includes('/_next/static/')) {
        cacheHeaders[url] = cacheControl
      }
    })
    
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Static assets should have proper cache headers
    Object.entries(cacheHeaders).forEach(([url, cacheControl]) => {
      if (url.includes('/_next/static/')) {
        // Static assets should have long cache times
        expect(cacheControl).toMatch(/max-age=\d+/)
        
        // Extract max-age value
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
        if (maxAgeMatch) {
          const maxAge = parseInt(maxAgeMatch[1])
          expect(maxAge).toBeGreaterThan(3600) // At least 1 hour
        }
      }
    })
  })

  test('should have optimized dependency loading', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Check for proper module loading
    const moduleInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      return {
        totalScripts: scripts.length,
        moduleScripts: scripts.filter(s => s.type === 'module').length,
        asyncScripts: scripts.filter(s => s.hasAttribute('async')).length,
        deferScripts: scripts.filter(s => s.hasAttribute('defer')).length,
        inlineScripts: scripts.filter(s => !s.src && s.textContent).length
      }
    })
    
    // Should use modern module loading
    expect(moduleInfo.moduleScripts + moduleInfo.asyncScripts + moduleInfo.deferScripts)
      .toBeGreaterThan(moduleInfo.totalScripts * 0.5) // At least 50% optimized loading
  })

  test('should minimize third-party impact', async ({ page }) => {
    const thirdPartyRequests: string[] = []
    
    // Track third-party requests
    page.on('request', request => {
      const url = request.url()
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        thirdPartyRequests.push(url)
      }
    })
    
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Trigger redundancy feature
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    await page.waitForTimeout(2000)
    
    // Should minimize third-party requests
    expect(thirdPartyRequests.length).toBeLessThan(10)
    
    // Common third-party domains should be expected ones
    const allowedDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com'
    ]
    
    thirdPartyRequests.forEach(url => {
      const domain = new URL(url).hostname
      const isAllowed = allowedDomains.some(allowed => domain.includes(allowed))
      
      if (!isAllowed) {
        console.warn(`Unexpected third-party request: ${url}`)
      }
    })
  })
})