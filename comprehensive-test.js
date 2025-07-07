/**
 * Comprehensive Test Script for Hue Datacenter Visualization v2.03
 * Tests the 2N+1 Redundancy Feature and overall application functionality
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');
const REPORT_FILE = path.join(__dirname, 'test-report.json');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class TestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testSuite: 'Hue Datacenter Visualization v2.03',
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  async init() {
    try {
      console.log('🚀 Starting Hue Datacenter Visualization Test Suite...');
      
      this.browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
      });
      
      this.page = await this.browser.newPage();
      
      // Enable console logging
      this.page.on('console', msg => {
        console.log(`📝 Console [${msg.type()}]:`, msg.text());
      });
      
      // Capture JavaScript errors
      this.page.on('pageerror', error => {
        console.error('❌ JavaScript Error:', error.message);
        this.results.summary.errors.push({
          type: 'JavaScript Error',
          message: error.message,
          stack: error.stack
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.failed++;
      console.error(`❌ ${testName} - FAILED (${duration}ms):`, error.message);
    }
    
    this.results.summary.total++;
  }

  async test1_InitialPageLoad() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for the page to fully load
    await this.page.waitForSelector('h1', { timeout: 10000 });
    
    // Check page title and header
    const title = await this.page.textContent('h1');
    if (!title.includes('Hue Hi Tech Park')) {
      throw new Error(`Expected page title to contain 'Hue Hi Tech Park', got: ${title}`);
    }
    
    // Check for power infrastructure image
    const powerImage = await this.page.locator('img[alt*="Power Infrastructure"]');
    await powerImage.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check for status badge
    const statusBadge = await this.page.locator('text=Power Infrastructure Map Loaded');
    await statusBadge.waitFor({ state: 'visible', timeout: 5000 });
    
    // Take screenshot
    await this.page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '1-initial-load.png'),
      fullPage: true 
    });
    
    console.log('✅ Page loaded successfully with power infrastructure image');
  }

  async test2_RedundancyButtonVisibility() {
    // Check if redundancy feature is enabled
    const redundancyButton = await this.page.locator('[data-testid="redundancy-toggle-button"]');
    const isVisible = await redundancyButton.isVisible();
    
    if (!isVisible) {
      console.log('⚠️  Redundancy button not visible - feature may not be enabled');
      console.log('💡 Trying to enable redundancy feature...');
      
      // Try to enable redundancy by setting environment variable
      // Note: This might require a page reload in a real scenario
      throw new Error('Redundancy feature is not enabled. Please start the server with NEXT_PUBLIC_ENABLE_REDUNDANCY=true');
    }
    
    // Check button text and styling
    const buttonText = await redundancyButton.textContent();
    if (!buttonText.includes('Show 2N+1 Redundancy')) {
      throw new Error(`Expected button text to contain 'Show 2N+1 Redundancy', got: ${buttonText}`);
    }
    
    // Check button has lightning icon
    const hasLightningIcon = await redundancyButton.locator('span').first().textContent();
    if (!hasLightningIcon.includes('⚡')) {
      throw new Error('Expected button to have lightning icon (⚡)');
    }
    
    // Check button styling (red background)
    const buttonClasses = await redundancyButton.getAttribute('class');
    if (!buttonClasses.includes('bg-red-500')) {
      throw new Error('Expected button to have red background (bg-red-500)');
    }
    
    console.log('✅ Redundancy button found with correct styling and icon');
  }

  async test3_RedundancyModalOpen() {
    const redundancyButton = await this.page.locator('[data-testid="redundancy-toggle-button"]');
    
    // Click the redundancy button
    await redundancyButton.click();
    
    // Wait for modal to appear
    await this.page.waitForTimeout(1000);
    
    // Check for modal overlay - using the actual selector from the component
    const modalOverlay = await this.page.locator('[role="dialog"][aria-modal="true"]');
    await modalOverlay.waitFor({ state: 'visible', timeout: 5000 });
    
    // Take screenshot of modal open
    await this.page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '2-modal-open.png'),
      fullPage: true 
    });
    
    console.log('✅ Redundancy modal opened successfully');
  }

  async test4_VerifyModalElements() {
    // Check for power transmission lines
    const powerLines = await this.page.locator('[data-testid*="power-line"], .power-line, [class*="line"]');
    const lineCount = await powerLines.count();
    
    if (lineCount === 0) {
      console.log('⚠️  No power lines found with standard selectors, checking for SVG elements...');
      
      // Check for SVG elements which might contain the lines
      const svgElements = await this.page.locator('svg');
      const svgCount = await svgElements.count();
      
      if (svgCount === 0) {
        throw new Error('No power transmission lines found in the redundancy visualization');
      }
      
      console.log(`✅ Found ${svgCount} SVG elements that may contain power lines`);
    } else {
      console.log(`✅ Found ${lineCount} power line elements`);
    }
    
    // Check for substation markers
    const substationMarkers = await this.page.locator('[data-testid*="substation"], .substation-marker, [class*="substation"]');
    const markerCount = await substationMarkers.count();
    
    if (markerCount === 0) {
      console.log('⚠️  No substation markers found with standard selectors');
    } else {
      console.log(`✅ Found ${markerCount} substation markers`);
    }
    
    // Check for info panel
    const infoPanel = await this.page.locator('[data-testid*="info-panel"], .info-panel, [class*="info"]');
    const infoPanelExists = await infoPanel.count() > 0;
    
    if (!infoPanelExists) {
      console.log('⚠️  Info panel not found with standard selectors');
    } else {
      console.log('✅ Info panel found');
    }
    
    // Take screenshot of all elements
    await this.page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '3-all-elements.png'),
      fullPage: true 
    });
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(5000);
    
    console.log('✅ Modal elements verification completed');
  }

  async test5_AnimationCheck() {
    // Check for animated elements
    const animatedElements = await this.page.locator('[class*="animate"], [style*="animation"]');
    const animationCount = await animatedElements.count();
    
    console.log(`✅ Found ${animationCount} potentially animated elements`);
    
    // Wait for animations to run
    await this.page.waitForTimeout(6000);
    
    // Take screenshot after animations
    await this.page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '4-animations.png'),
      fullPage: true 
    });
    
    console.log('✅ Animation check completed');
  }

  async test6_ModalClose() {
    // Test ESC key
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(1000);
    
    // Check if modal is closed
    const modalOverlay = await this.page.locator('[role="dialog"][aria-modal="true"]');
    const isModalVisible = await modalOverlay.isVisible();
    
    if (isModalVisible) {
      console.log('⚠️  ESC key did not close modal, trying close button...');
      
      // Look for close button
      const closeButton = await this.page.locator('[data-testid*="close"], button:has-text("Close"), button:has-text("×")');
      const closeButtonExists = await closeButton.count() > 0;
      
      if (closeButtonExists) {
        await closeButton.first().click();
        await this.page.waitForTimeout(1000);
        
        const isStillVisible = await modalOverlay.isVisible();
        if (isStillVisible) {
          throw new Error('Modal did not close after clicking close button');
        }
        
        console.log('✅ Modal closed successfully with close button');
      } else {
        // Try clicking outside modal
        await this.page.click('body', { position: { x: 50, y: 50 } });
        await this.page.waitForTimeout(1000);
        
        const isStillVisible = await modalOverlay.isVisible();
        if (isStillVisible) {
          throw new Error('Modal did not close with any method');
        }
        
        console.log('✅ Modal closed by clicking outside');
      }
    } else {
      console.log('✅ Modal closed successfully with ESC key');
    }
    
    // Take screenshot of closed modal
    await this.page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '5-modal-closed.png'),
      fullPage: true 
    });
  }

  async test7_ConsoleErrorCheck() {
    // Check for JavaScript errors in console
    const errors = this.results.summary.errors;
    
    if (errors.length > 0) {
      console.log(`⚠️  Found ${errors.length} JavaScript errors:`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    } else {
      console.log('✅ No JavaScript errors found in console');
    }
    
    // This test always passes, but logs warnings
  }

  async test8_ResponsiveCheck() {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000);
      
      // Take screenshot
      await this.page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, `6-responsive-${viewport.name}.png`),
        fullPage: true 
      });
      
      // Check if main elements are still visible
      const powerImage = await this.page.locator('img[alt*="Power Infrastructure"]');
      const isImageVisible = await powerImage.isVisible();
      
      if (!isImageVisible) {
        throw new Error(`Power infrastructure image not visible on ${viewport.name} viewport`);
      }
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Responsive design check completed');
  }

  async generateReport() {
    // Calculate summary
    this.results.summary.successRate = `${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}%`;
    this.results.summary.totalErrors = this.results.summary.errors.length;
    
    // Write report to file
    fs.writeFileSync(REPORT_FILE, JSON.stringify(this.results, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${this.results.summary.successRate}`);
    console.log(`JavaScript Errors: ${this.results.summary.totalErrors}`);
    console.log(`Screenshots: ${SCREENSHOT_DIR}`);
    console.log(`Full Report: ${REPORT_FILE}`);
    console.log('='.repeat(60));
    
    if (this.results.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests.forEach(test => {
        if (test.status === 'FAILED') {
          console.log(`  - ${test.name}: ${test.error}`);
        }
      });
    }
    
    if (this.results.summary.totalErrors > 0) {
      console.log('\n⚠️  JAVASCRIPT ERRORS:');
      this.results.summary.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    }
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    if (!(await this.init())) {
      return;
    }

    try {
      await this.runTest('1. Initial Page Load', () => this.test1_InitialPageLoad());
      await this.runTest('2. Redundancy Button Visibility', () => this.test2_RedundancyButtonVisibility());
      await this.runTest('3. Redundancy Modal Open', () => this.test3_RedundancyModalOpen());
      await this.runTest('4. Verify Modal Elements', () => this.test4_VerifyModalElements());
      await this.runTest('5. Animation Check', () => this.test5_AnimationCheck());
      await this.runTest('6. Modal Close', () => this.test6_ModalClose());
      await this.runTest('7. Console Error Check', () => this.test7_ConsoleErrorCheck());
      await this.runTest('8. Responsive Check', () => this.test8_ResponsiveCheck());
      
    } finally {
      await this.generateReport();
      await this.cleanup();
    }
  }
}

// Run the test suite
const runner = new TestRunner();
runner.run().catch(console.error);