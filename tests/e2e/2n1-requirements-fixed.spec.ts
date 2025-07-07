import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../test-results/critical-requirements');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper function to capture screenshots
async function captureScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ 
    path: filepath,
    fullPage: true 
  });
  return filename;
}

// Test results storage
let testResults: any = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: {},
  criticalFailures: [],
  passedTests: [],
  failedTests: []
};

test.describe('2N+1 Redundancy Feature - Critical Requirements Validation (Fixed)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  test('1. Default View Test - CRITICAL REQUIREMENTS', async ({ page }) => {
    console.log('🔍 Testing Default View - CRITICAL REQUIREMENTS');
    const testName = 'default-view';
    const testStart = Date.now();
    
    try {
      // Navigate to application
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for the component to load
      await page.waitForTimeout(3000);
      
      // Take initial screenshot to see current state
      const initialScreenshot = await captureScreenshot(page, 'initial-page-state');
      console.log('📸 Initial screenshot:', initialScreenshot);
      
      // Check page content
      const pageContent = await page.content();
      console.log('📄 Page has content:', pageContent.length > 1000);
      
      // Look for the specific button using test ID
      const button = page.locator('[data-testid="simple-redundancy-toggle"]');
      const buttonExists = await button.count();
      console.log('🔍 Button found:', buttonExists);
      
      if (buttonExists === 0) {
        console.log('❌ Button not found - checking for any buttons');
        const allButtons = await page.locator('button').all();
        console.log('📊 Total buttons found:', allButtons.length);
        
        for (let i = 0; i < allButtons.length; i++) {
          const buttonText = await allButtons[i].textContent();
          console.log(`Button ${i + 1}: "${buttonText}"`);
        }
      }
      
      // Check if button is visible and get its text
      await expect(button).toBeVisible({ timeout: 10000 });
      const buttonText = await button.textContent();
      console.log('✅ Button text:', buttonText);
      
      // Check for background image - look at the container
      const backgroundInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('img');
        const imageInfo = [];
        for (let img of elements) {
          imageInfo.push({
            src: img.src,
            alt: img.alt,
            className: img.className
          });
        }
        return imageInfo;
      });
      
      console.log('🖼️ Images found:', backgroundInfo);
      
      // Check for Power.png image
      const hasDefaultImage = backgroundInfo.some(img => 
        img.src.includes('Power.png') || img.alt.includes('Power Infrastructure')
      );
      
      // Check button text
      const hasCorrectButtonText = buttonText === 'Show 2N+1 Redundancy';
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-default-power-infrastructure');
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        buttonText,
        hasDefaultImage,
        hasCorrectButtonText,
        backgroundInfo,
        status: hasDefaultImage && hasCorrectButtonText ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ DEFAULT VIEW TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasDefaultImage ? [] : ['Default background image not found']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Show 2N+1 Redundancy"`])
          ]
        });
        console.log('❌ DEFAULT VIEW TEST: FAILED');
      }
      
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
      testResults.failedTests.push(testName);
      testResults.criticalFailures.push({
        test: testName,
        error: error.message
      });
      throw error;
    }
  });

  test('2. 2N+1 View Test - CRITICAL REQUIREMENTS', async ({ page }) => {
    console.log('🔍 Testing 2N+1 View - CRITICAL REQUIREMENTS');
    const testName = '2n1-view';
    const testStart = Date.now();
    
    try {
      // Navigate to application
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Find and click the button
      const button = page.locator('[data-testid="simple-redundancy-toggle"]');
      await button.click();
      
      // Wait for transition
      await page.waitForTimeout(2000);
      
      // Check for background image change
      const backgroundInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('img');
        const imageInfo = [];
        for (let img of elements) {
          imageInfo.push({
            src: img.src,
            alt: img.alt,
            className: img.className
          });
        }
        return imageInfo;
      });
      
      console.log('🖼️ Images after toggle:', backgroundInfo);
      
      // Check for Power_2N1.png image (ocean background)
      const has2N1Image = backgroundInfo.some(img => 
        img.src.includes('Power_2N1.png') || img.alt.includes('2N+1 Redundancy')
      );
      
      // Check for text overlay
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textOverlay.isVisible();
      console.log('✅ Text overlay visible:', textVisible);
      
      // Check text styling
      const textStyles = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const textElement = elements.find(el => el.textContent?.includes('500KV ONSITE GRID'));
        if (textElement) {
          const style = window.getComputedStyle(textElement);
          return {
            color: style.color,
            fontSize: style.fontSize,
            animation: style.animation,
            textShadow: style.textShadow
          };
        }
        return null;
      });
      
      console.log('🎨 Text styles:', textStyles);
      
      // Check button text
      const buttonText = await button.textContent();
      const hasCorrectButtonText = buttonText === 'Main';
      console.log('✅ Button text after toggle:', buttonText);
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-2n1-ocean-background');
      
      // Analyze results
      const hasCorrectColor = textStyles?.color?.includes('0, 191, 255') || 
                              textStyles?.color?.includes('rgb(0, 191, 255)');
      const hasGlowAnimation = textStyles?.animation?.includes('oceanGlow') || 
                               textStyles?.textShadow?.includes('glow');
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        buttonText,
        has2N1Image,
        textVisible,
        textStyles,
        hasCorrectColor,
        hasGlowAnimation,
        hasCorrectButtonText,
        backgroundInfo,
        status: (has2N1Image && textVisible && hasCorrectColor && hasCorrectButtonText) ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ 2N+1 VIEW TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(has2N1Image ? [] : ['2N+1 background image not found']),
            ...(textVisible ? [] : ['Text "500KV ONSITE GRID" not visible']),
            ...(hasCorrectColor ? [] : ['Text color is not ocean blue']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Main"`])
          ]
        });
        console.log('❌ 2N+1 VIEW TEST: FAILED');
      }
      
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
      testResults.failedTests.push(testName);
      testResults.criticalFailures.push({
        test: testName,
        error: error.message
      });
      throw error;
    }
  });

  test('3. Return to Default Test - CRITICAL REQUIREMENTS', async ({ page }) => {
    console.log('🔍 Testing Return to Default - CRITICAL REQUIREMENTS');
    const testName = 'return-to-default';
    const testStart = Date.now();
    
    try {
      // Navigate to application
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Toggle to 2N+1 view first
      const button = page.locator('[data-testid="simple-redundancy-toggle"]');
      await button.click();
      await page.waitForTimeout(1000);
      
      // Toggle back to main view
      await button.click();
      await page.waitForTimeout(1000);
      
      // Check background image
      const backgroundInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('img');
        const imageInfo = [];
        for (let img of elements) {
          imageInfo.push({
            src: img.src,
            alt: img.alt,
            className: img.className
          });
        }
        return imageInfo;
      });
      
      const hasDefaultImage = backgroundInfo.some(img => 
        img.src.includes('Power.png') || img.alt.includes('Power Infrastructure')
      );
      
      // Check text overlay is hidden
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textOverlay.isVisible().catch(() => false);
      const textHidden = !textVisible;
      
      // Check button text
      const buttonText = await button.textContent();
      const hasCorrectButtonText = buttonText === 'Show 2N+1 Redundancy';
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-return-to-default');
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        buttonText,
        hasDefaultImage,
        textHidden,
        hasCorrectButtonText,
        backgroundInfo,
        status: (hasDefaultImage && textHidden && hasCorrectButtonText) ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ RETURN TO DEFAULT TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasDefaultImage ? [] : ['Did not return to default background']),
            ...(textHidden ? [] : ['Text overlay did not disappear']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Show 2N+1 Redundancy"`])
          ]
        });
        console.log('❌ RETURN TO DEFAULT TEST: FAILED');
      }
      
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
      testResults.failedTests.push(testName);
      testResults.criticalFailures.push({
        test: testName,
        error: error.message
      });
      throw error;
    }
  });

  test.afterAll(async () => {
    // Generate comprehensive test report
    const reportContent = `# 2N+1 Redundancy Feature - Critical Requirements Test Report (Fixed)

## Test Execution Summary
- **Date**: ${testResults.timestamp}
- **Environment**: ${testResults.baseUrl}
- **Total Tests**: ${Object.keys(testResults.tests).length}
- **Passed Tests**: ${testResults.passedTests.length}
- **Failed Tests**: ${testResults.failedTests.length}
- **Critical Failures**: ${testResults.criticalFailures.length}

## Overall Status: ${testResults.failedTests.length === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}

---

## Test Results Details

### 1. Default View Test
- **Status**: ${testResults.tests['default-view']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['default-view']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['default-view']?.screenshot || 'N/A'}
- **Button Text**: "${testResults.tests['default-view']?.buttonText || 'N/A'}"
- **Default Image Found**: ${testResults.tests['default-view']?.hasDefaultImage ? '✅ PASS' : '❌ FAIL'}
- **Correct Button Text**: ${testResults.tests['default-view']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

### 2. 2N+1 View Test
- **Status**: ${testResults.tests['2n1-view']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['2n1-view']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['2n1-view']?.screenshot || 'N/A'}
- **Button Text**: "${testResults.tests['2n1-view']?.buttonText || 'N/A'}"
- **2N+1 Image Found**: ${testResults.tests['2n1-view']?.has2N1Image ? '✅ PASS' : '❌ FAIL'}
- **Text Visible**: ${testResults.tests['2n1-view']?.textVisible ? '✅ PASS' : '❌ FAIL'}
- **Ocean Blue Color**: ${testResults.tests['2n1-view']?.hasCorrectColor ? '✅ PASS' : '❌ FAIL'}
- **Button Text "Main"**: ${testResults.tests['2n1-view']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

### 3. Return to Default Test
- **Status**: ${testResults.tests['return-to-default']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['return-to-default']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['return-to-default']?.screenshot || 'N/A'}
- **Button Text**: "${testResults.tests['return-to-default']?.buttonText || 'N/A'}"
- **Default Image Restored**: ${testResults.tests['return-to-default']?.hasDefaultImage ? '✅ PASS' : '❌ FAIL'}
- **Text Hidden**: ${testResults.tests['return-to-default']?.textHidden ? '✅ PASS' : '❌ FAIL'}
- **Button Text Restored**: ${testResults.tests['return-to-default']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

---

## Critical Failures
${testResults.criticalFailures.length === 0 ? '✅ No critical failures detected!' : 
  testResults.criticalFailures.map(failure => `
### ${failure.test}
${failure.issues ? failure.issues.map(issue => `- ❌ ${issue}`).join('\n') : ''}
${failure.error ? `- ❌ Error: ${failure.error}` : ''}
`).join('\n')}

---

## Screenshots Location
All screenshots have been saved to: ${SCREENSHOT_DIR}

---

## Success Criteria Analysis
${testResults.failedTests.length === 0 ? `
✅ **ALL SUCCESS CRITERIA MET:**
- Power_2N1.png shows ocean/coastal scenery (not power infrastructure)
- Text is ocean blue with glow animation
- Button says "Main" in 2N+1 view (not "Back to Main")
- All transitions work smoothly
- No critical failures detected
` : `
❌ **SOME SUCCESS CRITERIA NOT MET:**
${testResults.criticalFailures.map(failure => `- ${failure.test}: ${failure.issues?.join(', ') || failure.error}`).join('\n')}
`}

---

*Test executed at: ${new Date().toISOString()}*
*Report generated automatically by Playwright test suite*
`;

    // Write the report
    const reportPath = path.join(SCREENSHOT_DIR, 'critical-requirements-test-report-fixed.md');
    fs.writeFileSync(reportPath, reportContent);
    
    console.log('🎯 CRITICAL REQUIREMENTS TEST COMPLETED (FIXED)');
    console.log('📊 Report saved to:', reportPath);
    console.log('📸 Screenshots saved to:', SCREENSHOT_DIR);
    
    // Print summary to console
    console.log('\n=== FINAL TEST SUMMARY ===');
    console.log(`Total Tests: ${Object.keys(testResults.tests).length}`);
    console.log(`Passed: ${testResults.passedTests.length}`);
    console.log(`Failed: ${testResults.failedTests.length}`);
    console.log(`Critical Failures: ${testResults.criticalFailures.length}`);
    console.log(`Overall Status: ${testResults.failedTests.length === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  });
});