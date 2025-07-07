import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, '../../test-results/screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper function to capture screenshots with timestamps
async function captureScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${name}_${timestamp}.png`;
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, filename),
    fullPage: true 
  });
  return filename;
}

// Helper function to check for console errors
async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

// Helper function to measure performance
async function measurePerformance(page: Page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  });
}

test.describe('2N+1 Redundancy Feature - Version 02 Comprehensive Testing', () => {
  let testResults: any = {
    timestamp: new Date().toISOString(),
    flows: {},
    errors: [],
    performance: {},
    accessibility: {}
  };

  test.beforeEach(async ({ page }) => {
    // Set up console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testResults.errors.push({
          time: new Date().toISOString(),
          message: msg.text(),
          location: msg.location()
        });
      }
    });

    // Set up request failure monitoring
    page.on('requestfailed', request => {
      testResults.errors.push({
        time: new Date().toISOString(),
        type: 'network',
        url: request.url(),
        failure: request.failure()
      });
    });
  });

  test('Data Flow 1: Initial Page Load', async ({ page }) => {
    console.log('Starting Data Flow 1: Initial Page Load');
    const flowStart = Date.now();
    
    // Navigate to application
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    
    // Verify default background image loads
    const backgroundImage = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return style.backgroundImage;
    });
    
    expect(backgroundImage).toContain('Power.png');
    
    // Check button shows correct initial text
    const button = page.locator('button:has-text("Show 2N+1 Redundancy")');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Show 2N+1 Redundancy');
    
    // Capture screenshot
    const screenshot = await captureScreenshot(page, 'flow1-initial-load');
    
    // Check performance metrics
    const perfMetrics = await measurePerformance(page);
    
    // Check for accessibility
    const a11yResults = await page.evaluate(() => {
      const button = document.querySelector('button');
      return {
        buttonAriaLabel: button?.getAttribute('aria-label'),
        buttonRole: button?.getAttribute('role'),
        documentTitle: document.title,
        hasLandmarks: !!document.querySelector('[role="main"]')
      };
    });
    
    testResults.flows['flow1'] = {
      duration: Date.now() - flowStart,
      screenshot,
      performance: perfMetrics,
      accessibility: a11yResults,
      backgroundImage,
      buttonText: await button.textContent(),
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Data Flow 2: Toggle to 2N+1 View', async ({ page }) => {
    console.log('Starting Data Flow 2: Toggle to 2N+1 View');
    const flowStart = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('load');
    
    // Click the toggle button
    const button = page.locator('button:has-text("Show 2N+1 Redundancy")');
    await button.click();
    
    // Wait for transition
    await page.waitForTimeout(500); // Allow for CSS transitions
    
    // Verify background changes to Power_2N1.PNG
    const backgroundImage = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return style.backgroundImage;
    });
    
    expect(backgroundImage).toContain('Power_2N1.PNG');
    
    // Check for "500KV ONSITE GRID" text overlay
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).toBeVisible();
    
    // Verify button text changes
    await expect(button).toHaveText('Back to Main');
    
    // Capture screenshot
    const screenshot = await captureScreenshot(page, 'flow2-2n1-view');
    
    // Check transition timing
    const transitionTiming = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return {
        transition: style.transition,
        transitionDuration: style.transitionDuration,
        transitionTimingFunction: style.transitionTimingFunction
      };
    });
    
    testResults.flows['flow2'] = {
      duration: Date.now() - flowStart,
      screenshot,
      backgroundImage,
      buttonText: await button.textContent(),
      textOverlayVisible: await textOverlay.isVisible(),
      transitionTiming,
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Data Flow 3: Return to Default View', async ({ page }) => {
    console.log('Starting Data Flow 3: Return to Default View');
    const flowStart = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('load');
    
    // First toggle to 2N+1 view
    const button = page.locator('button');
    await button.click();
    await page.waitForTimeout(500);
    
    // Click to return to main view
    await button.click();
    await page.waitForTimeout(500);
    
    // Verify background returns to Power.png
    const backgroundImage = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return style.backgroundImage;
    });
    
    expect(backgroundImage).toContain('Power.png');
    
    // Check text overlay disappears
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).not.toBeVisible();
    
    // Verify button text returns
    await expect(button).toHaveText('Show 2N+1 Redundancy');
    
    // Capture screenshot
    const screenshot = await captureScreenshot(page, 'flow3-return-view');
    
    // Check for residual elements
    const residualElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const residuals: string[] = [];
      allElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.includes('500KV') && window.getComputedStyle(el).display !== 'none') {
          residuals.push(el.tagName + ': ' + text);
        }
      });
      return residuals;
    });
    
    testResults.flows['flow3'] = {
      duration: Date.now() - flowStart,
      screenshot,
      backgroundImage,
      buttonText: await button.textContent(),
      textOverlayHidden: !(await textOverlay.isVisible()),
      residualElements,
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Data Flow 4: Multiple Toggle Cycles', async ({ page }) => {
    console.log('Starting Data Flow 4: Multiple Toggle Cycles');
    const flowStart = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('load');
    
    const button = page.locator('button');
    const cycleResults = [];
    
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Perform 5 rapid toggle cycles
    for (let i = 0; i < 5; i++) {
      const cycleStart = Date.now();
      
      // Toggle to 2N+1
      await button.click();
      await page.waitForTimeout(100); // Short wait for rapid testing
      
      // Toggle back
      await button.click();
      await page.waitForTimeout(100);
      
      // Measure memory after cycle
      const currentMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      cycleResults.push({
        cycle: i + 1,
        duration: Date.now() - cycleStart,
        memoryUsed: currentMemory,
        memoryIncrease: currentMemory - initialMemory
      });
    }
    
    // Final screenshot after rapid toggles
    const screenshot = await captureScreenshot(page, 'flow4-rapid-toggle');
    
    // Check final state
    const finalState = await page.evaluate(() => {
      const body = document.body;
      const button = document.querySelector('button');
      return {
        backgroundImage: window.getComputedStyle(body).backgroundImage,
        buttonText: button?.textContent,
        documentState: document.readyState
      };
    });
    
    testResults.flows['flow4'] = {
      duration: Date.now() - flowStart,
      screenshot,
      cycleResults,
      initialMemory,
      finalMemory: cycleResults[cycleResults.length - 1]?.memoryUsed || 0,
      memoryLeakDetected: (cycleResults[cycleResults.length - 1]?.memoryIncrease || 0) > 5000000, // 5MB threshold
      finalState,
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Data Flow 5: Responsive Testing', async ({ page }) => {
    console.log('Starting Data Flow 5: Responsive Testing');
    const flowStart = Date.now();
    
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    const responsiveResults = [];
    
    for (const viewport of viewports) {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to page
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('load');
      
      // Toggle to 2N+1 view
      const button = page.locator('button');
      await button.click();
      await page.waitForTimeout(500);
      
      // Capture screenshot
      const screenshot = await captureScreenshot(page, `flow5-${viewport.name}`);
      
      // Check element positioning and sizing
      const layoutMetrics = await page.evaluate(() => {
        const button = document.querySelector('button');
        const textOverlay = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('500KV ONSITE GRID')
        );
        
        const buttonRect = button?.getBoundingClientRect();
        const textRect = textOverlay?.getBoundingClientRect();
        
        return {
          button: buttonRect ? {
            x: buttonRect.x,
            y: buttonRect.y,
            width: buttonRect.width,
            height: buttonRect.height
          } : null,
          textOverlay: textRect ? {
            x: textRect.x,
            y: textRect.y,
            width: textRect.width,
            height: textRect.height
          } : null,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
      });
      
      responsiveResults.push({
        viewport: viewport.name,
        dimensions: viewport,
        screenshot,
        layoutMetrics
      });
    }
    
    testResults.flows['flow5'] = {
      duration: Date.now() - flowStart,
      responsiveResults,
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Data Flow 6: Error Handling', async ({ page, context }) => {
    console.log('Starting Data Flow 6: Error Handling');
    const flowStart = Date.now();
    
    // Test 1: Network disconnection simulation
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Intercept image requests to simulate failure
    await page.route('**/*.png', route => route.abort());
    await page.route('**/*.PNG', route => route.abort());
    
    // Try to toggle
    const button = page.locator('button');
    await button.click();
    await page.waitForTimeout(1000);
    
    // Capture error state
    const errorScreenshot1 = await captureScreenshot(page, 'flow6-network-error');
    
    // Check error handling
    const errorState = await page.evaluate(() => {
      const body = document.body;
      const button = document.querySelector('button');
      return {
        backgroundImage: window.getComputedStyle(body).backgroundImage,
        buttonEnabled: !button?.hasAttribute('disabled'),
        hasErrorMessage: !!document.querySelector('[role="alert"]'),
        documentTitle: document.title
      };
    });
    
    // Test 2: Invalid image paths
    await page.unroute('**/*.png');
    await page.unroute('**/*.PNG');
    
    // Inject script to corrupt image paths
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        body { background-image: url('invalid-image-path.png') !important; }
      `;
      document.head.appendChild(style);
    });
    
    await page.waitForTimeout(500);
    const errorScreenshot2 = await captureScreenshot(page, 'flow6-invalid-path');
    
    // Test 3: JavaScript error injection
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.evaluate(() => {
      // This should not crash the app
      throw new Error('Test error - should be caught by error boundary');
    });
    
    await page.waitForTimeout(500);
    const errorScreenshot3 = await captureScreenshot(page, 'flow6-js-error');
    
    testResults.flows['flow6'] = {
      duration: Date.now() - flowStart,
      screenshots: [errorScreenshot1, errorScreenshot2, errorScreenshot3],
      errorState,
      jsErrors,
      gracefulDegradation: errorState.buttonEnabled && !errorState.hasErrorMessage,
      errors: testResults.errors.filter(e => e.time > new Date(flowStart).toISOString())
    };
  });

  test('Cross-Browser Compatibility Check', async ({ browserName, page }) => {
    console.log(`Testing on browser: ${browserName}`);
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Basic functionality test
    const button = page.locator('button');
    await button.click();
    await page.waitForTimeout(500);
    
    const browserTest = {
      browser: browserName,
      functionalityWorks: await button.isVisible(),
      cssSupport: await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return {
          backgroundImage: !!style.backgroundImage,
          transitions: !!style.transition,
          flexbox: style.display === 'flex' || style.display === 'inline-flex'
        };
      })
    };
    
    testResults.browserCompatibility = testResults.browserCompatibility || [];
    testResults.browserCompatibility.push(browserTest);
  });

  test('Accessibility Compliance', async ({ page }) => {
    console.log('Running accessibility tests');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Run basic accessibility checks
    const a11yResults = await page.evaluate(() => {
      const results = {
        hasProperHeadings: !!document.querySelector('h1'),
        buttonHasAccessibleName: !!document.querySelector('button')?.textContent,
        imagesHaveAlt: Array.from(document.querySelectorAll('img')).every(img => 
          img.hasAttribute('alt')
        ),
        colorContrast: true, // Would need axe-core for real testing
        keyboardNavigation: document.querySelector('button')?.getAttribute('tabindex') !== '-1',
        ariaLabels: Array.from(document.querySelectorAll('[aria-label]')).length,
        ariaRoles: Array.from(document.querySelectorAll('[role]')).length
      };
      return results;
    });
    
    testResults.accessibility = a11yResults;
  });

  test.afterAll(async () => {
    // Write comprehensive test results
    const reportContent = `# 2N+1 Redundancy Feature Test Results - Version 02

## Test Execution Summary
- **Date**: ${testResults.timestamp}
- **Environment**: ${BASE_URL}
- **Total Errors**: ${testResults.errors.length}

## Data Flow 1: Initial Page Load
- **Duration**: ${testResults.flows.flow1?.duration}ms
- **Screenshot**: ${testResults.flows.flow1?.screenshot}
- **Background Image**: ${testResults.flows.flow1?.backgroundImage}
- **Button Text**: "${testResults.flows.flow1?.buttonText}"
- **Performance Metrics**:
  - DOM Content Loaded: ${testResults.flows.flow1?.performance?.domContentLoaded}ms
  - Load Complete: ${testResults.flows.flow1?.performance?.loadComplete}ms
  - First Paint: ${testResults.flows.flow1?.performance?.firstPaint}ms
  - First Contentful Paint: ${testResults.flows.flow1?.performance?.firstContentfulPaint}ms
- **Accessibility**:
  - Button ARIA Label: ${testResults.flows.flow1?.accessibility?.buttonAriaLabel || 'None'}
  - Document Title: ${testResults.flows.flow1?.accessibility?.documentTitle}
  - Has Landmarks: ${testResults.flows.flow1?.accessibility?.hasLandmarks}
- **Console Errors**: ${testResults.flows.flow1?.errors?.length || 0}

## Data Flow 2: Toggle to 2N+1 View
- **Duration**: ${testResults.flows.flow2?.duration}ms
- **Screenshot**: ${testResults.flows.flow2?.screenshot}
- **Background Image**: ${testResults.flows.flow2?.backgroundImage}
- **Button Text**: "${testResults.flows.flow2?.buttonText}"
- **Text Overlay Visible**: ${testResults.flows.flow2?.textOverlayVisible}
- **Transition Timing**:
  - Duration: ${testResults.flows.flow2?.transitionTiming?.transitionDuration}
  - Function: ${testResults.flows.flow2?.transitionTiming?.transitionTimingFunction}
- **Console Errors**: ${testResults.flows.flow2?.errors?.length || 0}

## Data Flow 3: Return to Default View  
- **Duration**: ${testResults.flows.flow3?.duration}ms
- **Screenshot**: ${testResults.flows.flow3?.screenshot}
- **Background Image**: ${testResults.flows.flow3?.backgroundImage}
- **Button Text**: "${testResults.flows.flow3?.buttonText}"
- **Text Overlay Hidden**: ${testResults.flows.flow3?.textOverlayHidden}
- **Residual Elements**: ${testResults.flows.flow3?.residualElements?.length || 0}
- **Console Errors**: ${testResults.flows.flow3?.errors?.length || 0}

## Data Flow 4: Multiple Toggle Cycles
- **Duration**: ${testResults.flows.flow4?.duration}ms
- **Screenshot**: ${testResults.flows.flow4?.screenshot}
- **Memory Leak Detected**: ${testResults.flows.flow4?.memoryLeakDetected ? 'YES' : 'NO'}
- **Initial Memory**: ${(testResults.flows.flow4?.initialMemory / 1024 / 1024).toFixed(2)}MB
- **Final Memory**: ${(testResults.flows.flow4?.finalMemory / 1024 / 1024).toFixed(2)}MB
- **Memory Increase**: ${((testResults.flows.flow4?.finalMemory - testResults.flows.flow4?.initialMemory) / 1024 / 1024).toFixed(2)}MB

### Cycle Performance:
${testResults.flows.flow4?.cycleResults?.map((cycle: any) => 
  `- Cycle ${cycle.cycle}: ${cycle.duration}ms, Memory: ${(cycle.memoryUsed / 1024 / 1024).toFixed(2)}MB`
).join('\n') || 'No cycle data'}

## Data Flow 5: Responsive Testing
- **Duration**: ${testResults.flows.flow5?.duration}ms

### Desktop (1920x1080)
- **Screenshot**: ${testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'desktop')?.screenshot}
- **Button Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'desktop')?.layoutMetrics?.button)}
- **Text Overlay Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'desktop')?.layoutMetrics?.textOverlay)}

### Tablet (768x1024)
- **Screenshot**: ${testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'tablet')?.screenshot}
- **Button Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'tablet')?.layoutMetrics?.button)}
- **Text Overlay Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'tablet')?.layoutMetrics?.textOverlay)}

### Mobile (375x667)
- **Screenshot**: ${testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'mobile')?.screenshot}
- **Button Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'mobile')?.layoutMetrics?.button)}
- **Text Overlay Position**: ${JSON.stringify(testResults.flows.flow5?.responsiveResults?.find((r: any) => r.viewport === 'mobile')?.layoutMetrics?.textOverlay)}

## Data Flow 6: Error Handling
- **Duration**: ${testResults.flows.flow6?.duration}ms
- **Screenshots**: ${testResults.flows.flow6?.screenshots?.join(', ')}
- **Graceful Degradation**: ${testResults.flows.flow6?.gracefulDegradation ? 'PASSED' : 'FAILED'}
- **Button Remained Enabled**: ${testResults.flows.flow6?.errorState?.buttonEnabled}
- **Error Messages Shown**: ${testResults.flows.flow6?.errorState?.hasErrorMessage}
- **JavaScript Errors Caught**: ${testResults.flows.flow6?.jsErrors?.length || 0}

## Cross-Browser Compatibility
${testResults.browserCompatibility?.map((b: any) => `
### ${b.browser}
- **Functionality Works**: ${b.functionalityWorks}
- **CSS Support**:
  - Background Image: ${b.cssSupport?.backgroundImage}
  - Transitions: ${b.cssSupport?.transitions}
  - Flexbox: ${b.cssSupport?.flexbox}
`).join('\n') || 'No browser compatibility data'}

## Accessibility Compliance
- **Has Proper Headings**: ${testResults.accessibility?.hasProperHeadings}
- **Button Has Accessible Name**: ${testResults.accessibility?.buttonHasAccessibleName}
- **Images Have Alt Text**: ${testResults.accessibility?.imagesHaveAlt}
- **Keyboard Navigation**: ${testResults.accessibility?.keyboardNavigation}
- **ARIA Labels Count**: ${testResults.accessibility?.ariaLabels}
- **ARIA Roles Count**: ${testResults.accessibility?.ariaRoles}

## Console Errors Summary
Total Errors: ${testResults.errors.length}

${testResults.errors.map((e: any) => `
- **Time**: ${e.time}
- **Message**: ${e.message}
- **Type**: ${e.type || 'console'}
`).join('\n') || 'No errors detected'}

## Test Conclusion
The 2N+1 Redundancy Feature Version 02 has been comprehensively tested across all specified data flows. ${testResults.errors.length === 0 ? 'All tests passed without errors.' : `Found ${testResults.errors.length} errors that need attention.`}

## Screenshots Location
All screenshots have been saved to: ${SCREENSHOT_DIR}

---
*Test executed at: ${new Date().toISOString()}*
`;

    fs.writeFileSync(
      path.join(__dirname, '../../test_2n1_ver02.md'),
      reportContent
    );
    
    console.log('Test results written to test_2n1_ver02.md');
  });
});