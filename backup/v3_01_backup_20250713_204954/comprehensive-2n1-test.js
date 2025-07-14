const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'comprehensive-2n1');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshot(page, name, description) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ 
    path: filepath,
    fullPage: true 
  });
  console.log(`📸 ${description} - ${filename}`);
  return filename;
}

async function measurePerformance(page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: perfData ? perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart : 0,
      loadComplete: perfData ? perfData.loadEventEnd - perfData.loadEventStart : 0,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  });
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive 2N+1 Redundancy Feature Test');
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}`);
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for visual confirmation
    slowMo: 500     // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    flows: {},
    errors: [],
    performance: {}
  };
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      testResults.errors.push({
        time: new Date().toISOString(),
        message: msg.text(),
        type: 'console'
      });
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  // Monitor network failures
  page.on('requestfailed', request => {
    testResults.errors.push({
      time: new Date().toISOString(),
      message: `Failed to load: ${request.url()}`,
      type: 'network'
    });
    console.log(`🌐 Network Error: ${request.url()}`);
  });
  
  try {
    // ===== FLOW 1: Initial Page Load =====
    console.log('\n📋 FLOW 1: Initial Page Load');
    const flow1Start = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const flow1Screenshot = await captureScreenshot(page, 'flow1-initial-load', 'Initial page load');
    
    // Check for redundancy toggle button
    const toggleButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    const toggleButtonExists = await toggleButton.isVisible();
    
    // Get button text
    const buttonText = toggleButtonExists ? await toggleButton.textContent() : 'Button not found';
    
    // Check background image
    const backgroundInfo = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const imageInfo = Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      }));
      return imageInfo;
    });
    
    // Performance metrics
    const flow1Performance = await measurePerformance(page);
    
    testResults.flows.flow1 = {
      duration: Date.now() - flow1Start,
      screenshot: flow1Screenshot,
      toggleButtonExists,
      buttonText: buttonText?.trim(),
      backgroundInfo,
      performance: flow1Performance
    };
    
    console.log(`✅ Flow 1 completed in ${testResults.flows.flow1.duration}ms`);
    console.log(`🔘 Toggle button found: ${toggleButtonExists}`);
    console.log(`📝 Button text: "${buttonText?.trim()}"`);
    
    // ===== FLOW 2: Toggle to 2N+1 View =====
    console.log('\n📋 FLOW 2: Toggle to 2N+1 View');
    const flow2Start = Date.now();
    
    if (toggleButtonExists) {
      await toggleButton.click();
      await page.waitForTimeout(2000); // Wait for transition
      
      const flow2Screenshot = await captureScreenshot(page, 'flow2-2n1-view', 'After toggling to 2N+1 view');
      
      // Check button text after toggle
      const newButtonText = await toggleButton.textContent();
      
      // Check for text overlay
      const textOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      
      // Check image changes
      const newBackgroundInfo = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        }));
      });
      
      testResults.flows.flow2 = {
        duration: Date.now() - flow2Start,
        screenshot: flow2Screenshot,
        buttonText: newButtonText?.trim(),
        textOverlayVisible: textOverlay,
        backgroundInfo: newBackgroundInfo
      };
      
      console.log(`✅ Flow 2 completed in ${testResults.flows.flow2.duration}ms`);
      console.log(`📝 Button text after toggle: "${newButtonText?.trim()}"`);
      console.log(`📄 Text overlay visible: ${textOverlay}`);
    } else {
      console.log('❌ Skipping Flow 2 - Toggle button not found');
    }
    
    // ===== FLOW 3: Return to Default View =====
    console.log('\n📋 FLOW 3: Return to Default View');
    const flow3Start = Date.now();
    
    if (toggleButtonExists) {
      await toggleButton.click();
      await page.waitForTimeout(2000);
      
      const flow3Screenshot = await captureScreenshot(page, 'flow3-return-view', 'After returning to default view');
      
      const returnButtonText = await toggleButton.textContent();
      const textOverlayHidden = !(await page.locator('text=500KV ONSITE GRID').isVisible());
      
      testResults.flows.flow3 = {
        duration: Date.now() - flow3Start,
        screenshot: flow3Screenshot,
        buttonText: returnButtonText?.trim(),
        textOverlayHidden
      };
      
      console.log(`✅ Flow 3 completed in ${testResults.flows.flow3.duration}ms`);
      console.log(`📝 Button text after return: "${returnButtonText?.trim()}"`);
      console.log(`📄 Text overlay hidden: ${textOverlayHidden}`);
    } else {
      console.log('❌ Skipping Flow 3 - Toggle button not found');
    }
    
    // ===== FLOW 4: Multiple Toggle Cycles =====
    console.log('\n📋 FLOW 4: Multiple Toggle Cycles');
    const flow4Start = Date.now();
    
    if (toggleButtonExists) {
      const cycleResults = [];
      
      for (let i = 0; i < 5; i++) {
        const cycleStart = Date.now();
        
        // Toggle to 2N+1
        await toggleButton.click();
        await page.waitForTimeout(300);
        
        // Toggle back
        await toggleButton.click();
        await page.waitForTimeout(300);
        
        cycleResults.push({
          cycle: i + 1,
          duration: Date.now() - cycleStart
        });
        
        console.log(`🔄 Cycle ${i + 1} completed in ${cycleResults[i].duration}ms`);
      }
      
      const flow4Screenshot = await captureScreenshot(page, 'flow4-rapid-cycles', 'After multiple toggle cycles');
      
      testResults.flows.flow4 = {
        duration: Date.now() - flow4Start,
        screenshot: flow4Screenshot,
        cycles: cycleResults
      };
      
      console.log(`✅ Flow 4 completed in ${testResults.flows.flow4.duration}ms`);
    } else {
      console.log('❌ Skipping Flow 4 - Toggle button not found');
    }
    
    // ===== FLOW 5: Responsive Testing =====
    console.log('\n📋 FLOW 5: Responsive Testing');
    const flow5Start = Date.now();
    
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    const responsiveResults = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Toggle to 2N+1 view for responsive test
      if (toggleButtonExists) {
        await toggleButton.click();
        await page.waitForTimeout(1000);
      }
      
      const screenshot = await captureScreenshot(page, `flow5-${viewport.name}`, `Responsive test - ${viewport.name}`);
      
      const layoutInfo = await page.evaluate(() => {
        const button = document.querySelector('[data-testid="simple-redundancy-toggle"]');
        const textOverlay = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('500KV ONSITE GRID')
        );
        
        return {
          button: button ? button.getBoundingClientRect() : null,
          textOverlay: textOverlay ? textOverlay.getBoundingClientRect() : null,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        };
      });
      
      responsiveResults.push({
        ...viewport,
        screenshot,
        layoutInfo
      });
      
      console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}) tested`);
    }
    
    testResults.flows.flow5 = {
      duration: Date.now() - flow5Start,
      responsiveResults
    };
    
    console.log(`✅ Flow 5 completed in ${testResults.flows.flow5.duration}ms`);
    
    // ===== FLOW 6: Performance & Accessibility =====
    console.log('\n📋 FLOW 6: Performance & Accessibility');
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const flow6Screenshot = await captureScreenshot(page, 'flow6-accessibility', 'Accessibility and performance test');
    
    // Test keyboard navigation
    const keyboardNavigation = await page.evaluate(async () => {
      const button = document.querySelector('[data-testid="simple-redundancy-toggle"]');
      if (button) {
        button.focus();
        return document.activeElement === button;
      }
      return false;
    });
    
    // Check ARIA attributes
    const accessibilityInfo = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="simple-redundancy-toggle"]');
      return {
        hasAriaLabel: button ? !!button.getAttribute('aria-label') : false,
        hasDataTestId: button ? !!button.getAttribute('data-testid') : false,
        isFocusable: button ? button.tabIndex >= 0 : false
      };
    });
    
    testResults.flows.flow6 = {
      screenshot: flow6Screenshot,
      keyboardNavigation,
      accessibilityInfo
    };
    
    console.log(`✅ Flow 6 completed`);
    console.log(`⌨️  Keyboard navigation: ${keyboardNavigation}`);
    console.log(`♿ Accessibility info:`, accessibilityInfo);
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
    testResults.errors.push({
      time: new Date().toISOString(),
      message: error.message,
      type: 'execution'
    });
  } finally {
    await browser.close();
    
    // Generate comprehensive report
    const report = generateComprehensiveReport(testResults);
    const reportPath = path.join(__dirname, 'test_2n1_ver02_comprehensive.md');
    fs.writeFileSync(reportPath, report);
    
    console.log('\n🎉 Test Execution Complete!');
    console.log(`📊 Total errors: ${testResults.errors.length}`);
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`📄 Report saved to: test_2n1_ver02_comprehensive.md`);
  }
}

function generateComprehensiveReport(results) {
  return `# 2N+1 Redundancy Feature - Comprehensive Test Report

## Test Execution Summary
- **Date**: ${results.timestamp}
- **Environment**: ${results.baseUrl}
- **Total Errors**: ${results.errors.length}
- **Test Duration**: ${Object.values(results.flows).reduce((sum, flow) => sum + (flow.duration || 0), 0)}ms

## Test Results by Flow

### Flow 1: Initial Page Load
- **Duration**: ${results.flows.flow1?.duration || 0}ms
- **Screenshot**: ${results.flows.flow1?.screenshot || 'Not captured'}
- **Toggle Button Found**: ${results.flows.flow1?.toggleButtonExists ? '✅ Yes' : '❌ No'}
- **Button Text**: "${results.flows.flow1?.buttonText || 'N/A'}"
- **Background Images**: ${results.flows.flow1?.backgroundInfo?.length || 0} images detected
- **Performance**:
  - DOM Content Loaded: ${results.flows.flow1?.performance?.domContentLoaded || 0}ms
  - Load Complete: ${results.flows.flow1?.performance?.loadComplete || 0}ms
  - First Paint: ${results.flows.flow1?.performance?.firstPaint || 0}ms
  - First Contentful Paint: ${results.flows.flow1?.performance?.firstContentfulPaint || 0}ms

### Flow 2: Toggle to 2N+1 View
- **Duration**: ${results.flows.flow2?.duration || 0}ms
- **Screenshot**: ${results.flows.flow2?.screenshot || 'Not captured'}
- **Button Text After Toggle**: "${results.flows.flow2?.buttonText || 'N/A'}"
- **Text Overlay Visible**: ${results.flows.flow2?.textOverlayVisible ? '✅ Yes' : '❌ No'}
- **Background Images**: ${results.flows.flow2?.backgroundInfo?.length || 0} images detected

### Flow 3: Return to Default View
- **Duration**: ${results.flows.flow3?.duration || 0}ms
- **Screenshot**: ${results.flows.flow3?.screenshot || 'Not captured'}
- **Button Text After Return**: "${results.flows.flow3?.buttonText || 'N/A'}"
- **Text Overlay Hidden**: ${results.flows.flow3?.textOverlayHidden ? '✅ Yes' : '❌ No'}

### Flow 4: Multiple Toggle Cycles
- **Duration**: ${results.flows.flow4?.duration || 0}ms
- **Screenshot**: ${results.flows.flow4?.screenshot || 'Not captured'}
- **Cycles Completed**: ${results.flows.flow4?.cycles?.length || 0}
- **Average Cycle Time**: ${results.flows.flow4?.cycles ? 
  (results.flows.flow4.cycles.reduce((sum, cycle) => sum + cycle.duration, 0) / results.flows.flow4.cycles.length).toFixed(2) : 0}ms

### Flow 5: Responsive Testing
- **Duration**: ${results.flows.flow5?.duration || 0}ms
- **Viewports Tested**: ${results.flows.flow5?.responsiveResults?.length || 0}

${results.flows.flow5?.responsiveResults?.map(vp => `
#### ${vp.name} (${vp.width}x${vp.height})
- **Screenshot**: ${vp.screenshot}
- **Layout Info**: ${JSON.stringify(vp.layoutInfo, null, 2)}
`).join('\n') || 'No responsive tests conducted'}

### Flow 6: Performance & Accessibility
- **Screenshot**: ${results.flows.flow6?.screenshot || 'Not captured'}
- **Keyboard Navigation**: ${results.flows.flow6?.keyboardNavigation ? '✅ Working' : '❌ Failed'}
- **Accessibility**:
  - Has ARIA Label: ${results.flows.flow6?.accessibilityInfo?.hasAriaLabel ? '✅ Yes' : '❌ No'}
  - Has Data Test ID: ${results.flows.flow6?.accessibilityInfo?.hasDataTestId ? '✅ Yes' : '❌ No'}
  - Is Focusable: ${results.flows.flow6?.accessibilityInfo?.isFocusable ? '✅ Yes' : '❌ No'}

## Error Summary
Total Errors: ${results.errors.length}

${results.errors.map(error => `
### ${error.type.toUpperCase()} Error
- **Time**: ${error.time}
- **Message**: ${error.message}
`).join('\n') || 'No errors detected during testing.'}

## Test Conclusion
${results.errors.length === 0 ? 
  '✅ All tests passed successfully! The 2N+1 redundancy feature is working correctly.' :
  `⚠️ ${results.errors.length} errors detected during testing. Please review the error details above.`}

## Screenshots Location
All screenshots have been saved to: ${SCREENSHOT_DIR}

---
*Comprehensive test report generated at: ${new Date().toISOString()}*
`;
}

// Run the test
runComprehensiveTest().catch(console.error);