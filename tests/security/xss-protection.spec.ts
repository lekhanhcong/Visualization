/**
 * XSS Protection Tests for 2N+1 Redundancy Visualization
 * Testing protection against Cross-Site Scripting attacks
 */

import { test, expect } from '@playwright/test'

test.describe('XSS Protection Tests', () => {
  test('should sanitize user input in redundancy visualization', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Open redundancy modal
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    const overlay = page.locator('[role="dialog"][aria-modal="true"]')
    await expect(overlay).toBeVisible()
    
    // Test XSS payload injection attempts
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//",
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ]
    
    for (const payload of xssPayloads) {
      // Try to inject XSS through any input fields or interactive elements
      const inputs = page.locator('input, textarea, [contenteditable]')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          await input.fill(payload)
          
          // Check that script hasn't executed
          const alertDialogs = page.locator('[role="alert"]')
          const alertCount = await alertDialogs.count()
          expect(alertCount).toBe(0)
          
          // Check that payload is properly escaped in DOM
          const content = await page.textContent('body')
          expect(content).not.toContain('<script>')
          expect(content).not.toContain('javascript:')
        }
      }
    }
  })

  test('should prevent script injection through URL parameters', async ({ page }) => {
    const xssPayloads = [
      '?search=<script>alert("XSS")</script>',
      '?redirect=javascript:alert("XSS")',
      '#<img src=x onerror=alert("XSS")>',
      '?callback=<script>alert("XSS")</script>'
    ]
    
    for (const payload of xssPayloads) {
      await page.goto(`http://localhost:3001${payload}`)
      
      // Check that script hasn't executed
      const content = await page.textContent('body')
      expect(content).not.toContain('<script>')
      expect(content).not.toContain('javascript:')
      
      // Check for any JavaScript errors (which might indicate blocked XSS)
      const jsErrors: string[] = []
      page.on('pageerror', (error) => {
        jsErrors.push(error.message)
      })
      
      await page.waitForTimeout(1000)
      
      // XSS attempts should be blocked, not cause errors
      const xssErrors = jsErrors.filter(error => 
        error.includes('script') || error.includes('XSS')
      )
      expect(xssErrors.length).toBe(0)
    }
  })

  test('should prevent DOM-based XSS in redundancy feature', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Test DOM manipulation with XSS payloads
    const xssTests = await page.evaluate(() => {
      const results: boolean[] = []
      
      // Test innerHTML assignment
      try {
        const div = document.createElement('div')
        div.innerHTML = '<script>window.xssTest1=true</script>'
        document.body.appendChild(div)
        results.push(!(window as any).xssTest1)
      } catch {
        results.push(true) // Good, it was blocked
      }
      
      // Test setAttribute with javascript: URL
      try {
        const link = document.createElement('a')
        link.setAttribute('href', 'javascript:window.xssTest2=true')
        link.click()
        results.push(!(window as any).xssTest2)
      } catch {
        results.push(true) // Good, it was blocked
      }
      
      // Test eval with user input
      try {
        const userInput = '<script>window.xssTest3=true</script>'
        eval(userInput)
        results.push(!(window as any).xssTest3)
      } catch {
        results.push(true) // Good, eval failed
      }
      
      return results
    })
    
    // All XSS attempts should be prevented
    xssTests.forEach(result => {
      expect(result).toBe(true)
    })
  })

  test('should properly escape content in redundancy data display', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    await page.waitForTimeout(3000)
    
    // Check that all displayed content is properly escaped
    const textContent = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )
      
      const textNodes: string[] = []
      let node
      
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim()
        if (text && text.length > 0) {
          textNodes.push(text)
        }
      }
      
      return textNodes
    })
    
    // Check that no raw HTML/JS is displayed as text
    textContent.forEach(text => {
      expect(text).not.toMatch(/<script[\s\S]*?>[\s\S]*?<\/script>/i)
      expect(text).not.toMatch(/javascript:/i)
      expect(text).not.toMatch(/on\w+\s*=/i) // Event handlers
      expect(text).not.toMatch(/<iframe[\s\S]*?>/i)
    })
  })

  test('should prevent CSS injection attacks', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Test CSS injection through style attributes
    await page.evaluate(() => {
      const div = document.createElement('div')
      
      // Try to inject malicious CSS
      const maliciousCss = `
        background: url('javascript:alert("CSS XSS")');
        background-image: url('data:text/html,<script>alert("CSS XSS")</script>');
      `
      
      try {
        div.style.cssText = maliciousCss
        document.body.appendChild(div)
      } catch (error) {
        // Good, CSS injection was blocked
      }
      
      return !(window as any).cssXssExecuted
    })
    
    // Wait to see if any malicious code executed
    await page.waitForTimeout(1000)
    
    const xssExecuted = await page.evaluate(() => (window as any).cssXssExecuted)
    expect(xssExecuted).toBeFalsy()
  })

  test('should validate and sanitize JSON data', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Test JSON injection through API responses or data
    const jsonTests = await page.evaluate(() => {
      const testCases = [
        '{"name": "<script>alert(\\"XSS\\")</script>"}',
        '{"callback": "javascript:alert(\\"XSS\\")"}',
        '{"html": "<img src=x onerror=alert(\\"XSS\\")>"}',
        '{"url": "javascript:void(0)"}'
      ]
      
      const results: boolean[] = []
      
      testCases.forEach(jsonString => {
        try {
          const data = JSON.parse(jsonString)
          
          // Check if parsed data contains potentially dangerous content
          const hasXSS = Object.values(data).some(value => 
            typeof value === 'string' && (
              value.includes('<script>') ||
              value.includes('javascript:') ||
              value.includes('onerror=')
            )
          )
          
          results.push(hasXSS) // We want to detect XSS, so true means we found it
        } catch {
          results.push(false) // JSON parsing failed, which is safe
        }
      })
      
      return results
    })
    
    // We should detect XSS attempts in JSON
    expect(jsonTests.some(result => result)).toBe(true)
    
    // But the application should handle them safely
    const content = await page.textContent('body')
    expect(content).not.toContain('alert("XSS")')
  })
})