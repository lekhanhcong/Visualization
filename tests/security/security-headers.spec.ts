/**
 * Security Headers Tests for 2N+1 Redundancy Visualization
 * Testing security headers and configurations
 */

import { test, expect } from '@playwright/test'

test.describe('Security Headers Tests', () => {
  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3001')
    
    // Check for security headers
    const headers = response?.headers() || {}
    
    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff')
    
    // X-Frame-Options
    expect(headers['x-frame-options']).toBe('DENY')
    
    // X-XSS-Protection
    expect(headers['x-xss-protection']).toBe('1; mode=block')
    
    // Content Security Policy (if implemented)
    if (headers['content-security-policy']) {
      expect(headers['content-security-policy']).toContain("default-src")
    }
    
    // Strict-Transport-Security (if HTTPS)
    if (page.url().startsWith('https://')) {
      expect(headers['strict-transport-security']).toBeTruthy()
    }
  })

  test('should not expose sensitive information in headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3001')
    const headers = response?.headers() || {}
    
    // Should not expose server information
    expect(headers['server']).toBeUndefined()
    expect(headers['x-powered-by']).toBeUndefined()
    
    // Should not expose Next.js version in production
    if (process.env.NODE_ENV === 'production') {
      expect(headers['x-nextjs-cache']).toBeUndefined()
    }
  })

  test('should have proper CORS configuration', async ({ page }) => {
    const response = await page.goto('http://localhost:3001')
    const headers = response?.headers() || {}
    
    // Check CORS headers if present
    if (headers['access-control-allow-origin']) {
      // Should not be wildcard in production
      if (process.env.NODE_ENV === 'production') {
        expect(headers['access-control-allow-origin']).not.toBe('*')
      }
    }
  })

  test('should prevent clickjacking attacks', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Try to embed the page in an iframe
    const frameResult = await page.evaluate(() => {
      try {
        const iframe = document.createElement('iframe')
        iframe.src = window.location.href
        document.body.appendChild(iframe)
        return 'allowed'
      } catch (error) {
        return 'blocked'
      }
    })
    
    // Should be blocked by X-Frame-Options
    expect(frameResult).toBe('blocked')
  })

  test('should have secure cookie configuration', async ({ page, context }) => {
    await page.goto('http://localhost:3001')
    
    const cookies = await context.cookies()
    
    cookies.forEach(cookie => {
      // Sensitive cookies should be secure
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        expect(cookie.secure).toBe(true)
        expect(cookie.httpOnly).toBe(true)
        expect(cookie.sameSite).toBe('Strict')
      }
    })
  })
})