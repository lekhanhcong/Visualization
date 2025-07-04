import { test, expect } from '@playwright/test'

test.describe('CSS Custom Properties', () => {
  test('should have infrastructure colors defined', async ({ page }) => {
    await page.goto('/')

    const color500kv = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-500kv'
      )
    )
    const color220kv = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-220kv'
      )
    )
    const color110kv = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-110kv'
      )
    )
    const colorDatacenter = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-datacenter'
      )
    )

    expect(color500kv.trim()).toBe('#ef4444')
    expect(color220kv.trim()).toBe('#3b82f6')
    expect(color110kv.trim()).toBe('#ec4899')
    expect(colorDatacenter.trim()).toBe('#10b981')
  })

  test('should have animation timing variables defined', async ({ page }) => {
    await page.goto('/')

    const durationFast = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--duration-fast'
      )
    )
    const durationNormal = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--duration-normal'
      )
    )

    expect(durationFast.trim()).toBe('150ms')
    expect(durationNormal.trim()).toBe('300ms')
  })

  test('should have easing functions defined', async ({ page }) => {
    await page.goto('/')

    const easeInOut = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--ease-in-out'
      )
    )
    const easeSpring = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--ease-spring'
      )
    )

    expect(easeInOut.trim()).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    expect(easeSpring.trim()).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)')
  })
})
