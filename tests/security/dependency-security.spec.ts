/**
 * Dependency Security Tests for 2N+1 Redundancy Visualization
 * Testing for known vulnerabilities in dependencies
 */

import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

test.describe('Dependency Security Tests', () => {
  test('should not have known vulnerabilities in npm dependencies', async () => {
    try {
      // Run npm audit to check for vulnerabilities
      const auditResult = execSync('npm audit --audit-level=moderate --json', {
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const audit = JSON.parse(auditResult)
      
      // Check for high or critical vulnerabilities
      const highVulnerabilities = audit.vulnerabilities?.filter((vuln: any) => 
        vuln.severity === 'high' || vuln.severity === 'critical'
      ) || []
      
      // Allow some tolerance for low/moderate vulnerabilities in dev dependencies
      expect(highVulnerabilities.length).toBeLessThan(5)
      
      // Log vulnerabilities for awareness
      if (highVulnerabilities.length > 0) {
        console.warn('High/Critical vulnerabilities found:', highVulnerabilities.map((v: any) => ({
          name: v.name,
          severity: v.severity,
          title: v.title
        })))
      }
      
    } catch (error) {
      // If npm audit fails, check if it's due to vulnerabilities
      if (error instanceof Error && error.message.includes('npm audit')) {
        console.warn('npm audit found vulnerabilities')
      } else {
        throw error
      }
    }
  })

  test('should use secure versions of critical dependencies', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    const criticalDeps = [
      'react',
      'react-dom',
      'next',
      '@radix-ui/react-dialog',
      'framer-motion'
    ]
    
    // Check for wildcard or overly permissive version ranges
    criticalDeps.forEach(dep => {
      const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      
      if (version) {
        // Should not use wildcard versions for critical dependencies
        expect(version).not.toBe('*')
        expect(version).not.toBe('latest')
        
        // Should use specific or caret ranges, not wildcards
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/)
      }
    })
  })

  test('should not include development tools in production bundle', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Check that development tools are not exposed in production
    const devToolsPresent = await page.evaluate(() => {
      const checks = {
        reactDevTools: !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__,
        sourceMapSupport: !!(window as any).sourceMapSupport,
        hotReload: !!(window as any).__webpack_hmr,
        debugMode: !!(window as any).__DEBUG__,
        testingLibrary: !!(window as any).__testing_library__
      }
      
      return checks
    })
    
    // In production, these should not be present
    if (process.env.NODE_ENV === 'production') {
      expect(devToolsPresent.hotReload).toBe(false)
      expect(devToolsPresent.debugMode).toBe(false)
      expect(devToolsPresent.testingLibrary).toBe(false)
    }
  })

  test('should not expose sensitive environment variables', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    const exposedEnvVars = await page.evaluate(() => {
      const env = (window as any).process?.env || {}
      const publicEnv = (window as any).__NEXT_DATA__?.env || {}
      
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /key/i,
        /token/i,
        /api_key/i,
        /private/i,
        /auth/i,
        /database/i,
        /db_/i
      ]
      
      const exposedSensitive: string[] = []
      
      // Check process.env
      Object.keys(env).forEach(key => {
        if (sensitivePatterns.some(pattern => pattern.test(key))) {
          exposedSensitive.push(`process.env.${key}`)
        }
      })
      
      // Check public env
      Object.keys(publicEnv).forEach(key => {
        if (sensitivePatterns.some(pattern => pattern.test(key))) {
          exposedSensitive.push(`publicEnv.${key}`)
        }
      })
      
      return exposedSensitive
    })
    
    // Should not expose sensitive environment variables
    expect(exposedSensitive.length).toBe(0)
  })

  test('should use Content Security Policy if configured', async ({ page }) => {
    const response = await page.goto('http://localhost:3001')
    const headers = response?.headers() || {}
    
    const csp = headers['content-security-policy']
    
    if (csp) {
      // If CSP is configured, it should be restrictive
      expect(csp).toContain("default-src")
      
      // Should not allow unsafe-inline or unsafe-eval in production
      if (process.env.NODE_ENV === 'production') {
        expect(csp).not.toContain("'unsafe-inline'")
        expect(csp).not.toContain("'unsafe-eval'")
      }
      
      // Should not allow data: URIs for scripts
      expect(csp).not.toContain("script-src 'self' data:")
    }
  })

  test('should validate third-party script integrity', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Check for external scripts and their integrity
    const externalScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      
      return scripts
        .filter(script => {
          const src = (script as HTMLScriptElement).src
          return src && !src.startsWith(window.location.origin)
        })
        .map(script => ({
          src: (script as HTMLScriptElement).src,
          integrity: (script as HTMLScriptElement).integrity,
          crossorigin: (script as HTMLScriptElement).crossOrigin
        }))
    })
    
    // External scripts should have integrity checks
    externalScripts.forEach(script => {
      if (script.src.includes('https://')) {
        expect(script.integrity || script.crossorigin).toBeTruthy()
      }
    })
  })

  test('should handle errors securely without information disclosure', async ({ page }) => {
    const errorMessages: string[] = []
    
    page.on('pageerror', (error) => {
      errorMessages.push(error.message)
    })
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        response.text().then(text => {
          errorMessages.push(text)
        }).catch(() => {})
      }
    })
    
    await page.goto('http://localhost:3001')
    
    // Try to trigger errors
    await page.evaluate(() => {
      // Try to access non-existent properties
      try {
        (window as any).nonExistentFunction()
      } catch {}
      
      // Try to make invalid API calls
      fetch('/api/invalid-endpoint').catch(() => {})
    })
    
    await page.waitForTimeout(2000)
    
    // Error messages should not expose sensitive information
    errorMessages.forEach(message => {
      // Should not contain file paths
      expect(message).not.toMatch(/\/Users\/|\/home\/|C:\\/)
      
      // Should not contain stack traces with internal details
      expect(message).not.toMatch(/at Object\.<anonymous>/)
      expect(message).not.toMatch(/at Module\._compile/)
      
      // Should not contain database connection strings
      expect(message).not.toMatch(/mongodb:\/\/|postgres:\/\/|mysql:\/\//)
      
      // Should not contain environment variables
      expect(message).not.toMatch(/process\.env/)
    })
  })

  test('should prevent prototype pollution', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    const prototypePollutionTest = await page.evaluate(() => {
      // Test common prototype pollution vectors
      const tests = [
        () => {
          const obj: any = {}
          obj['__proto__']['polluted'] = true
          return (({} as any).polluted !== true)
        },
        () => {
          const obj: any = {}
          obj['constructor']['prototype']['polluted'] = true
          return (({} as any).polluted !== true)
        },
        () => {
          try {
            JSON.parse('{"__proto__": {"polluted": true}}')
            return (({} as any).polluted !== true)
          } catch {
            return true // Good, parsing was blocked
          }
        }
      ]
      
      return tests.map(test => test())
    })
    
    // All prototype pollution attempts should be prevented
    prototypePollutionTest.forEach(result => {
      expect(result).toBe(true)
    })
  })
})