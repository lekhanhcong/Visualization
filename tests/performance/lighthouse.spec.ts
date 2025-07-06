/**
 * Lighthouse Performance Tests for 2N+1 Redundancy Visualization
 * Testing Core Web Vitals and performance metrics
 */

import { test, expect } from '@playwright/test'
import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'

interface LighthouseResult {
  lhr: {
    categories: {
      performance: { score: number }
      accessibility: { score: number }
      'best-practices': { score: number }
      seo: { score: number }
    }
    audits: {
      'first-contentful-paint': { numericValue: number }
      'largest-contentful-paint': { numericValue: number }
      'cumulative-layout-shift': { numericValue: number }
      'first-input-delay': { numericValue: number }
      'total-blocking-time': { numericValue: number }
      'speed-index': { numericValue: number }
      'interactive': { numericValue: number }
    }
  }
}

test.describe('Lighthouse Performance Tests', () => {
  let chrome: any
  
  test.beforeAll(async () => {
    chrome = await launch({ chromeFlags: ['--headless'] })
  })
  
  test.afterAll(async () => {
    if (chrome) {
      await chrome.kill()
    }
  })

  test('should meet Core Web Vitals thresholds on main page', async () => {
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      }
    }) as LighthouseResult

    const { lhr } = result
    
    // Performance score should be above 90
    expect(lhr.categories.performance.score).toBeGreaterThan(0.9)
    
    // Core Web Vitals thresholds
    expect(lhr.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500) // LCP < 2.5s
    expect(lhr.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.1)   // CLS < 0.1
    expect(lhr.audits['first-input-delay'].numericValue).toBeLessThan(100)         // FID < 100ms
    
    // Additional performance metrics
    expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(1800)   // FCP < 1.8s
    expect(lhr.audits['total-blocking-time'].numericValue).toBeLessThan(200)       // TBT < 200ms
    expect(lhr.audits['speed-index'].numericValue).toBeLessThan(3400)              // SI < 3.4s
    expect(lhr.audits['interactive'].numericValue).toBeLessThan(5200)              // TTI < 5.2s
  })

  test('should maintain performance with 2N+1 feature enabled', async ({ page }) => {
    // Enable the feature first
    await page.goto('http://localhost:3001')
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    // Wait for overlay to appear
    await page.waitForTimeout(1000)
    
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['performance'],
      formFactor: 'desktop'
    }) as LighthouseResult

    const { lhr } = result
    
    // Performance should still be acceptable with feature enabled
    expect(lhr.categories.performance.score).toBeGreaterThan(0.8)
    
    // Core Web Vitals should still be within acceptable ranges
    expect(lhr.audits['largest-contentful-paint'].numericValue).toBeLessThan(3000)
    expect(lhr.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.15)
  })

  test('should perform well on mobile devices', async () => {
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['performance'],
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150 * 3.75,
        downloadThroughputKbps: 1638.4 * 0.9,
        uploadThroughputKbps: 750 * 0.9
      }
    }) as LighthouseResult

    const { lhr } = result
    
    // Mobile performance score should be above 75
    expect(lhr.categories.performance.score).toBeGreaterThan(0.75)
    
    // Mobile Core Web Vitals (more lenient thresholds)
    expect(lhr.audits['largest-contentful-paint'].numericValue).toBeLessThan(4000)
    expect(lhr.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.1)
    expect(lhr.audits['first-input-delay'].numericValue).toBeLessThan(100)
  })

  test('should have good accessibility score', async () => {
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['accessibility']
    }) as LighthouseResult

    const { lhr } = result
    
    // Accessibility score should be above 95
    expect(lhr.categories.accessibility.score).toBeGreaterThan(0.95)
  })

  test('should follow best practices', async () => {
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['best-practices']
    }) as LighthouseResult

    const { lhr } = result
    
    // Best practices score should be above 90
    expect(lhr.categories['best-practices'].score).toBeGreaterThan(0.9)
  })

  test('should have good SEO score', async () => {
    const result = await lighthouse('http://localhost:3001', {
      port: chrome.port,
      onlyCategories: ['seo']
    }) as LighthouseResult

    const { lhr } = result
    
    // SEO score should be above 90
    expect(lhr.categories.seo.score).toBeGreaterThan(0.9)
  })
})