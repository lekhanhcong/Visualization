import { test, expect } from '@playwright/test'

test.describe('HEART Website Comprehensive Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to HEART page
    await page.goto('/heart')
    await page.waitForLoadState('networkidle')
  })

  test('Phase 1.1 - Basic page loading and navigation', async ({ page }) => {
    // Test 1: HEART page loads successfully
    await expect(page).toHaveTitle(/HEART/i)
    await page.screenshot({ path: 'test-screenshots/01-page-loaded.png', fullPage: true })
    
    // Test 2: Navigation component renders properly
    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/02-navigation-visible.png' })
    
    // Test 3: All navigation menu items are visible
    const navItems = ['LOCATION', 'TRANSPORTATION', 'DATA CENTER ZONES', 'ELECTRICITY', 'SUBMARINE CABLE SYSTEMS']
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible()
    }
    await page.screenshot({ path: 'test-screenshots/03-nav-items-visible.png' })
    
    // Test 4: Navigation logo and branding display
    await expect(page.locator('text=HEART')).toBeVisible()
    await expect(page.locator('text=Hue Ecological AI-Robotics Town')).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/04-branding-visible.png' })
  })

  test('Phase 1.2 - Section structure and content', async ({ page }) => {
    // Test 11-16: All sections load and display correctly
    const sections = ['location', 'transportation', 'datacenter', 'electricity', 'submarine']
    
    for (const sectionId of sections) {
      const section = page.locator(`#${sectionId}`)
      await expect(section).toBeVisible()
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000) // Wait for animations
      await page.screenshot({ path: `test-screenshots/section-${sectionId}.png`, fullPage: true })
    }
    
    // Test Footer
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await footer.scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-screenshots/footer-section.png', fullPage: true })
  })

  test('Phase 2.1 - Location section image animation', async ({ page }) => {
    // Navigate to location section
    await page.locator('#location').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    // Test 26-27: Images load correctly
    const locationImages = page.locator('#location img')
    await expect(locationImages.first()).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/location-images-1.png', fullPage: true })
    
    // Test 28-30: Image crossfade animation works with timing
    await page.waitForTimeout(4000) // Wait for first transition
    await page.screenshot({ path: 'test-screenshots/location-images-2.png', fullPage: true })
    
    // Test image indicators
    const indicators = page.locator('#location .w-3.h-3.rounded-full')
    await expect(indicators).toHaveCount(2)
    await page.screenshot({ path: 'test-screenshots/location-indicators.png' })
  })

  test('Phase 2.2 - Transportation section display', async ({ page }) => {
    // Navigate to transportation section
    await page.locator('#transportation').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    // Test 36: Transportation image loads correctly
    const transportationImage = page.locator('#transportation img')
    await expect(transportationImage).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/transportation-image.png', fullPage: true })
    
    // Test overlay information
    const overlay = page.locator('#transportation .bg-white\\/90')
    await expect(overlay).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/transportation-overlay.png' })
  })

  test('Phase 2.3 - Data center and connectivity images', async ({ page }) => {
    // Test Data Center section
    await page.locator('#datacenter').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    const datacenterImage = page.locator('#datacenter img')
    await expect(datacenterImage).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/datacenter-image.png', fullPage: true })
    
    // Test key features
    const features = page.locator('#datacenter .grid .text-center')
    await expect(features).toHaveCount(3)
    await page.screenshot({ path: 'test-screenshots/datacenter-features.png' })
    
    // Test Submarine Cable Systems
    await page.locator('#submarine').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    
    const submarineImages = page.locator('#submarine img')
    await expect(submarineImages.first()).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/submarine-images-1.png', fullPage: true })
    
    // Wait for image transition
    await page.waitForTimeout(4000)
    await page.screenshot({ path: 'test-screenshots/submarine-images-2.png', fullPage: true })
  })

  test('Phase 3.1 - Power flow animation core', async ({ page }) => {
    // Navigate to electricity section
    await page.locator('#electricity').scrollIntoViewIfNeeded()
    await page.waitForTimeout(3000) // Wait for animation to start
    
    // Test canvas animation
    const canvas = page.locator('#electricity canvas')
    await expect(canvas).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/power-flow-animation.png', fullPage: true })
    
    // Test voltage level indicators
    const voltageIndicators = page.locator('#electricity .grid .flex.items-center')
    await expect(voltageIndicators).toHaveCount(3)
    await page.screenshot({ path: 'test-screenshots/voltage-indicators.png' })
    
    // Test 2N+1 redundancy indicator
    const redundancyIndicator = page.locator('text=2N+1 Redundancy Active')
    await expect(redundancyIndicator).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/redundancy-indicator.png' })
  })

  test('Phase 4.1 - Responsive design testing', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-screenshots/desktop-layout.png', fullPage: true })
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-screenshots/tablet-layout.png', fullPage: true })
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-screenshots/mobile-layout.png', fullPage: true })
    
    // Test mobile navigation
    const mobileMenuButton = page.locator('.md\\:hidden button')
    await expect(mobileMenuButton).toBeVisible()
    await page.screenshot({ path: 'test-screenshots/mobile-navigation.png' })
  })

  test('Phase 5.1 - Performance testing', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now()
    await page.goto('/heart')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000) // Should load in under 3 seconds
    
    // Test First Contentful Paint
    const fcpTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve(fcpEntry.startTime)
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    console.log(`First Contentful Paint: ${fcpTime}ms`)
    await page.screenshot({ path: 'test-screenshots/performance-metrics.png', fullPage: true })
  })

  test('Phase 6.1 - Accessibility testing', async ({ page }) => {
    // Test color contrast (manual check via screenshot)
    await page.screenshot({ path: 'test-screenshots/accessibility-colors.png', fullPage: true })
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.screenshot({ path: 'test-screenshots/keyboard-focus-1.png' })
    
    await page.keyboard.press('Tab')
    await page.screenshot({ path: 'test-screenshots/keyboard-focus-2.png' })
    
    // Test navigation via keyboard
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: 'test-screenshots/keyboard-navigation.png' })
    
    // Test aria labels and semantic HTML
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    await page.screenshot({ path: 'test-screenshots/semantic-structure.png', fullPage: true })
  })

  test('Phase 6.2 - Cross-browser functionality', async ({ page, browserName }) => {
    console.log(`Testing on browser: ${browserName}`)
    
    // Test basic functionality works across browsers
    await expect(page).toHaveTitle(/HEART/i)
    
    // Test navigation works
    await page.click('text=LOCATION')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `test-screenshots/browser-${browserName}-navigation.png`, fullPage: true })
    
    // Test animations work
    await page.locator('#electricity').scrollIntoViewIfNeeded()
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `test-screenshots/browser-${browserName}-animations.png`, fullPage: true })
    
    // Test responsive behavior
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `test-screenshots/browser-${browserName}-mobile.png`, fullPage: true })
  })

  test('Complete user journey test', async ({ page }) => {
    // Test complete user flow from top to bottom
    const sections = ['location', 'transportation', 'datacenter', 'electricity', 'submarine']
    
    for (let i = 0; i < sections.length; i++) {
      const sectionId = sections[i]
      
      // Click navigation item
      await page.click(`text=${sectionId.toUpperCase().replace('DATACENTER', 'DATA CENTER ZONES').replace('SUBMARINE', 'SUBMARINE CABLE SYSTEMS')}`)
      await page.waitForTimeout(2000)
      
      // Verify section is in view
      const section = page.locator(`#${sectionId}`)
      await expect(section).toBeInViewport()
      
      // Take screenshot
      await page.screenshot({ path: `test-screenshots/journey-${i + 1}-${sectionId}.png`, fullPage: true })
      
      // Wait for any animations
      await page.waitForTimeout(3000)
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-screenshots/journey-complete.png', fullPage: true })
  })

})