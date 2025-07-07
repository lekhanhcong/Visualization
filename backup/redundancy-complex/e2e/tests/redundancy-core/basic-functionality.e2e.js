/**
 * Basic Functionality E2E Tests
 * Core redundancy feature functionality tests
 */

const { test, expect } = require('@playwright/test')
const { MainPage, RedundancyPage } = require('../../helpers/page-objects')
const { assertions, wait, screenshot, debug } = require('../../helpers/test-utils')

test.describe('Redundancy Feature - Basic Functionality', () => {
  let mainPage
  let redundancyPage

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page)
    redundancyPage = new RedundancyPage(page)

    debug.step('Navigating to application')
    await mainPage.goto('/')
    
    debug.step('Waiting for app to load')
    await mainPage.waitForAppLoad()
    
    debug.step('Enabling redundancy feature')
    await mainPage.enableRedundancyFeature()
    
    debug.step('Waiting for redundancy feature to initialize')
    await wait.forRedundancyLoad(page)
  })

  test('should display redundancy feature when enabled', async ({ page }) => {
    debug.step('Verifying redundancy container is visible')
    await assertions.assertVisible(
      page, 
      '[data-testid="redundancy-container"]',
      'Redundancy container is visible'
    )

    debug.step('Verifying redundancy button is present')
    await assertions.assertVisible(
      page,
      '.rdx-button',
      'Redundancy trigger button is visible'
    )

    debug.step('Taking screenshot of initial state')
    await screenshot.fullPage(page, 'redundancy-enabled-initial')
  })

  test('should show and hide redundancy overlay', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    
    debug.step('Verifying overlay is visible')
    await assertions.assertVisible(
      page,
      '.rdx-overlay',
      'Redundancy overlay is visible'
    )

    debug.step('Taking screenshot of overlay')
    await screenshot.overlay(page, 'overlay-visible')

    debug.step('Hiding redundancy overlay')
    await redundancyPage.hideRedundancyOverlay()
    
    debug.step('Verifying overlay is hidden')
    await wait.forOverlayHidden(page)
    
    const overlayVisible = await redundancyPage.isOverlayVisible()
    expect(overlayVisible).toBe(false)
    console.log('✅ Redundancy overlay is hidden')
  })

  test('should display substation markers', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Verifying substation markers are present')
    const substationCount = await redundancyPage.getSubstationCount()
    expect(substationCount).toBeGreaterThan(0)
    console.log(`✅ Found ${substationCount} substation markers`)

    debug.step('Verifying substation markers are interactive')
    await assertions.assertVisible(
      page,
      '.rdx-substation-marker',
      'Substation markers are visible'
    )

    debug.step('Taking screenshot of substations')
    await screenshot.element(page, '.rdx-substation-marker', 'substation-markers')
  })

  test('should display transmission lines', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Verifying transmission lines are present')
    const lineCount = await redundancyPage.getLineCount()
    expect(lineCount).toBeGreaterThan(0)
    console.log(`✅ Found ${lineCount} transmission lines`)

    debug.step('Verifying line highlights are visible')
    await assertions.assertVisible(
      page,
      '.rdx-line-highlight',
      'Line highlights are visible'
    )
  })

  test('should display info panel with system data', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Verifying info panel is visible')
    await assertions.assertVisible(
      page,
      '.rdx-info-panel',
      'Info panel is visible'
    )

    debug.step('Verifying redundancy level is displayed')
    const redundancyLevel = await redundancyPage.getRedundancyLevel()
    expect(redundancyLevel).toBeTruthy()
    console.log(`✅ Redundancy level: ${redundancyLevel}`)

    debug.step('Verifying system health is displayed')
    const systemHealth = await redundancyPage.getSystemHealth()
    expect(systemHealth).toBeTruthy()
    console.log(`✅ System health: ${systemHealth}`)

    debug.step('Taking screenshot of info panel')
    await screenshot.element(page, '.rdx-info-panel', 'info-panel')
  })

  test('should handle substation interaction', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Clicking on first substation')
    await redundancyPage.clickSubstation('e2e-sub-001')
    
    debug.step('Waiting for interaction response')
    await page.waitForTimeout(1000)

    debug.step('Verifying substation selection state')
    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-001"]',
      'aria-selected',
      'true',
      'Substation is selected'
    )

    debug.step('Taking screenshot of selected substation')
    await screenshot.element(page, '[data-testid="substation-e2e-sub-001"]', 'substation-selected')
  })

  test('should handle line hover interaction', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Hovering over transmission line')
    await redundancyPage.hoverLine('e2e-line-001')
    
    debug.step('Waiting for hover effect')
    await page.waitForTimeout(500)

    debug.step('Verifying line highlight on hover')
    await assertions.assertCSS(
      page,
      '[data-testid="line-e2e-line-001"]',
      'opacity',
      '1',
      'Line is highlighted on hover'
    )
  })

  test('should show power flow animations', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Verifying power flow animations are present')
    await assertions.assertVisible(
      page,
      '.rdx-power-flow-animation',
      'Power flow animations are visible'
    )

    debug.step('Waiting for animations to start')
    await wait.forAnimations(page)

    debug.step('Taking screenshot of animations')
    await screenshot.element(page, '.rdx-power-flow-animation', 'power-flow-animation')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Testing keyboard navigation')
    await redundancyPage.performKeyboardNavigation()

    debug.step('Verifying accessibility')
    const a11yResults = await redundancyPage.checkAccessibility()
    expect(a11yResults.focusableElements).toBeGreaterThan(0)
    console.log('✅ Keyboard navigation works correctly')
  })

  test('should handle settings panel', async ({ page }) => {
    debug.step('Showing redundancy overlay')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Opening settings panel')
    await redundancyPage.openSettings()

    debug.step('Verifying settings panel is open')
    const isSettingsOpen = await redundancyPage.isSettingsOpen()
    expect(isSettingsOpen).toBe(true)
    console.log('✅ Settings panel opened')

    debug.step('Taking screenshot of settings')
    await screenshot.element(page, '[data-testid="settings-modal"]', 'settings-panel')

    debug.step('Closing settings panel')
    await redundancyPage.closeSettings()

    debug.step('Verifying settings panel is closed')
    const isSettingsClosed = !await redundancyPage.isSettingsOpen()
    expect(isSettingsClosed).toBe(true)
    console.log('✅ Settings panel closed')
  })

  test('should handle errors gracefully', async ({ page }) => {
    debug.step('Checking for application errors')
    const hasError = await mainPage.hasError()
    expect(hasError).toBe(false)
    console.log('✅ No application errors detected')

    debug.step('Verifying no console errors')
    await assertions.assertNoErrors(page)
  })

  test.afterEach(async ({ page }) => {
    debug.step('Test cleanup')
    
    // Take final screenshot for debugging if test failed
    if (test.info().status === 'failed') {
      await screenshot.fullPage(page, `failed-${test.info().title}`)
      await debug.saveHTML(page, `failed-${test.info().title}`)
    }
  })
})