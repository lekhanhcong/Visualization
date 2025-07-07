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

test.describe('2N+1 Redundancy Feature - Critical Requirements Validation', () => {
  
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
      
      // Wait for any initial animations to complete
      await page.waitForTimeout(1000);
      
      // CRITICAL TEST 1: Verify shows Power.png background
      const backgroundImage = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundImage;
      });
      
      const hasCorrectDefaultBackground = backgroundImage.includes('Power.png');
      console.log('✅ Background image check:', backgroundImage);
      
      // CRITICAL TEST 2: Button text should be "Show 2N+1 Redundancy"
      const button = page.locator('button');
      await expect(button).toBeVisible();
      const buttonText = await button.textContent();
      const hasCorrectButtonText = buttonText === 'Show 2N+1 Redundancy';
      console.log('✅ Button text check:', buttonText);
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-default-power-infrastructure');
      
      // Check for any visible 2N+1 text (should NOT be present)
      const redundancyText = page.locator('text=500KV ONSITE GRID');
      const redundancyTextVisible = await redundancyText.isVisible().catch(() => false);
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        backgroundImage,
        buttonText,
        hasCorrectDefaultBackground,
        hasCorrectButtonText,
        redundancyTextVisible,
        status: hasCorrectDefaultBackground && hasCorrectButtonText ? 'PASS' : 'FAIL'
      };
      
      if (hasCorrectDefaultBackground && hasCorrectButtonText) {
        testResults.passedTests.push(testName);
        console.log('✅ DEFAULT VIEW TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasCorrectDefaultBackground ? [] : ['Background is not Power.png']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Show 2N+1 Redundancy"`])
          ]
        });
        console.log('❌ DEFAULT VIEW TEST: FAILED');
      }
      
      // Assertions
      expect(hasCorrectDefaultBackground, `Expected Power.png background, got: ${backgroundImage}`).toBe(true);
      expect(hasCorrectButtonText, `Expected "Show 2N+1 Redundancy", got: "${buttonText}"`).toBe(true);
      expect(redundancyTextVisible, 'Redundancy text should not be visible in default view').toBe(false);
      
    } catch (error) {
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
      
      // Find and click the button
      const button = page.locator('button', { hasText: 'Show 2N+1 Redundancy' });
      await button.click();
      
      // Wait for transition
      await page.waitForTimeout(2000);
      
      // CRITICAL TEST 1: Verify background changes to Power_2N1.PNG (ocean/coastal image)
      const backgroundImage = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundImage;
      });
      
      const hasCorrect2N1Background = backgroundImage.includes('Power_2N1.PNG');
      console.log('✅ 2N+1 Background image check:', backgroundImage);
      
      // CRITICAL TEST 2: Verify text "500KV ONSITE GRID" appears
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textOverlay.isVisible();
      console.log('✅ Text overlay visibility:', textVisible);
      
      // CRITICAL TEST 3: Verify text is ocean blue color (#00BFFF)
      const textStyles = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const textElement = elements.find(el => el.textContent?.includes('500KV ONSITE GRID'));
        if (textElement) {
          const style = window.getComputedStyle(textElement);
          return {
            color: style.color,
            fontSize: style.fontSize,
            position: style.position,
            animation: style.animation || style.animationName
          };
        }
        return null;
      });
      
      console.log('✅ Text styles:', textStyles);
      
      // Check if color is ocean blue (allowing for RGB conversion)
      const hasCorrectColor = textStyles?.color?.includes('0, 191, 255') || 
                              textStyles?.color?.includes('#00BFFF') || 
                              textStyles?.color?.includes('rgb(0, 191, 255)');
      
      // CRITICAL TEST 4: Verify text has smaller font size (around 18px)
      const fontSize = parseInt(textStyles?.fontSize || '0');
      const hasCorrectFontSize = fontSize >= 16 && fontSize <= 24; // Allow some flexibility
      
      // CRITICAL TEST 5: Verify text has ocean glow animation
      const hasGlowAnimation = textStyles?.animation?.includes('glow') || 
                               textStyles?.animation?.includes('ocean');
      
      // CRITICAL TEST 6: Button text should change to "Main" (NOT "Back to Main")
      const buttonText = await button.textContent();
      const hasCorrectButtonText = buttonText === 'Main';
      console.log('✅ Button text in 2N+1 view:', buttonText);
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-2n1-ocean-background');
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        backgroundImage,
        textVisible,
        textStyles,
        buttonText,
        hasCorrect2N1Background,
        hasCorrectColor,
        hasCorrectFontSize,
        hasGlowAnimation,
        hasCorrectButtonText,
        status: (hasCorrect2N1Background && textVisible && hasCorrectColor && 
                hasCorrectFontSize && hasGlowAnimation && hasCorrectButtonText) ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ 2N+1 VIEW TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasCorrect2N1Background ? [] : ['Background is not Power_2N1.PNG (ocean image)']),
            ...(textVisible ? [] : ['Text "500KV ONSITE GRID" is not visible']),
            ...(hasCorrectColor ? [] : ['Text is not ocean blue color (#00BFFF)']),
            ...(hasCorrectFontSize ? [] : [`Font size is ${fontSize}px, should be around 18px`]),
            ...(hasGlowAnimation ? [] : ['Text does not have ocean glow animation']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Main"`])
          ]
        });
        console.log('❌ 2N+1 VIEW TEST: FAILED');
      }
      
      // Assertions
      expect(hasCorrect2N1Background, `Expected Power_2N1.PNG background, got: ${backgroundImage}`).toBe(true);
      expect(textVisible, 'Text "500KV ONSITE GRID" should be visible').toBe(true);
      expect(hasCorrectColor, `Text should be ocean blue (#00BFFF), got: ${textStyles?.color}`).toBe(true);
      expect(hasCorrectFontSize, `Font size should be around 18px, got: ${fontSize}px`).toBe(true);
      expect(hasGlowAnimation, 'Text should have ocean glow animation').toBe(true);
      expect(hasCorrectButtonText, `Button should say "Main", got: "${buttonText}"`).toBe(true);
      
    } catch (error) {
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
      // Navigate to application and go to 2N+1 view first
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      
      // Click to go to 2N+1 view
      const button = page.locator('button');
      await button.click();
      await page.waitForTimeout(1000);
      
      // Now click "Main" button to return to default
      await button.click();
      await page.waitForTimeout(1000);
      
      // CRITICAL TEST 1: Verify returns to Power.png background
      const backgroundImage = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundImage;
      });
      
      const hasCorrectDefaultBackground = backgroundImage.includes('Power.png');
      console.log('✅ Background after return:', backgroundImage);
      
      // CRITICAL TEST 2: Verify text overlay disappears
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textOverlay.isVisible().catch(() => false);
      const textHidden = !textVisible;
      
      // CRITICAL TEST 3: Button text returns to "Show 2N+1 Redundancy"
      const buttonText = await button.textContent();
      const hasCorrectButtonText = buttonText === 'Show 2N+1 Redundancy';
      console.log('✅ Button text after return:', buttonText);
      
      // Capture screenshot
      const screenshotName = await captureScreenshot(page, 'test-return-to-default');
      
      // Record results
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        backgroundImage,
        buttonText,
        textHidden,
        hasCorrectDefaultBackground,
        hasCorrectButtonText,
        status: (hasCorrectDefaultBackground && textHidden && hasCorrectButtonText) ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ RETURN TO DEFAULT TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasCorrectDefaultBackground ? [] : ['Background did not return to Power.png']),
            ...(textHidden ? [] : ['Text overlay did not disappear']),
            ...(hasCorrectButtonText ? [] : [`Button text is "${buttonText}" instead of "Show 2N+1 Redundancy"`])
          ]
        });
        console.log('❌ RETURN TO DEFAULT TEST: FAILED');
      }
      
      // Assertions
      expect(hasCorrectDefaultBackground, `Expected Power.png background, got: ${backgroundImage}`).toBe(true);
      expect(textHidden, 'Text overlay should disappear').toBe(true);
      expect(hasCorrectButtonText, `Button should say "Show 2N+1 Redundancy", got: "${buttonText}"`).toBe(true);
      
    } catch (error) {
      testResults.failedTests.push(testName);
      testResults.criticalFailures.push({
        test: testName,
        error: error.message
      });
      throw error;
    }
  });

  test('4. Animation and Style Verification - CRITICAL REQUIREMENTS', async ({ page }) => {
    console.log('🔍 Testing Animation and Style - CRITICAL REQUIREMENTS');
    const testName = 'animation-style';
    const testStart = Date.now();
    
    try {
      // Navigate to application
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      
      // Click to go to 2N+1 view
      const button = page.locator('button');
      await button.click();
      await page.waitForTimeout(1000);
      
      // CRITICAL TEST 1: Verify ocean glow animation
      const animationDetails = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const textElement = elements.find(el => el.textContent?.includes('500KV ONSITE GRID'));
        if (textElement) {
          const style = window.getComputedStyle(textElement);
          return {
            animation: style.animation,
            animationName: style.animationName,
            animationDuration: style.animationDuration,
            animationTimingFunction: style.animationTimingFunction,
            animationIterationCount: style.animationIterationCount,
            textShadow: style.textShadow,
            filter: style.filter
          };
        }
        return null;
      });
      
      console.log('✅ Animation details:', animationDetails);
      
      // CRITICAL TEST 2: Verify text position stays fixed during animation
      const textElement = page.locator('text=500KV ONSITE GRID');
      const initialPosition = await textElement.boundingBox();
      
      // Wait a bit for animation to run
      await page.waitForTimeout(2000);
      
      const laterPosition = await textElement.boundingBox();
      const positionStable = initialPosition && laterPosition && 
                            Math.abs(initialPosition.x - laterPosition.x) < 5 &&
                            Math.abs(initialPosition.y - laterPosition.y) < 5;
      
      // CRITICAL TEST 3: Verify smooth transitions
      const transitionDetails = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return {
          transition: style.transition,
          transitionDuration: style.transitionDuration,
          transitionTimingFunction: style.transitionTimingFunction,
          transitionProperty: style.transitionProperty
        };
      });
      
      console.log('✅ Transition details:', transitionDetails);
      
      // Capture screenshot during animation
      const screenshotName = await captureScreenshot(page, 'test-animation-effects');
      
      // Record results
      const hasGlowAnimation = animationDetails?.animation?.includes('glow') || 
                              animationDetails?.animationName?.includes('glow') ||
                              animationDetails?.textShadow?.includes('glow') ||
                              animationDetails?.filter?.includes('glow');
      
      const hasSmoothTransitions = transitionDetails?.transition && 
                                  transitionDetails?.transitionDuration !== '0s';
      
      testResults.tests[testName] = {
        duration: Date.now() - testStart,
        screenshot: screenshotName,
        animationDetails,
        transitionDetails,
        initialPosition,
        laterPosition,
        positionStable,
        hasGlowAnimation,
        hasSmoothTransitions,
        status: (hasGlowAnimation && positionStable && hasSmoothTransitions) ? 'PASS' : 'FAIL'
      };
      
      if (testResults.tests[testName].status === 'PASS') {
        testResults.passedTests.push(testName);
        console.log('✅ ANIMATION AND STYLE TEST: PASSED');
      } else {
        testResults.failedTests.push(testName);
        testResults.criticalFailures.push({
          test: testName,
          issues: [
            ...(hasGlowAnimation ? [] : ['Text does not have ocean glow animation']),
            ...(positionStable ? [] : ['Text position is not stable during animation']),
            ...(hasSmoothTransitions ? [] : ['Transitions are not smooth'])
          ]
        });
        console.log('❌ ANIMATION AND STYLE TEST: FAILED');
      }
      
      // Assertions
      expect(hasGlowAnimation, 'Text should have ocean glow animation').toBe(true);
      expect(positionStable, 'Text position should stay fixed during animation').toBe(true);
      expect(hasSmoothTransitions, 'Should have smooth transitions between states').toBe(true);
      
    } catch (error) {
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
    const reportContent = `# 2N+1 Redundancy Feature - Critical Requirements Test Report

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
- **Background Image**: ${testResults.tests['default-view']?.backgroundImage || 'N/A'}
- **Button Text**: "${testResults.tests['default-view']?.buttonText || 'N/A'}"
- **Correct Background**: ${testResults.tests['default-view']?.hasCorrectDefaultBackground ? '✅ PASS' : '❌ FAIL'}
- **Correct Button Text**: ${testResults.tests['default-view']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

### 2. 2N+1 View Test
- **Status**: ${testResults.tests['2n1-view']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['2n1-view']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['2n1-view']?.screenshot || 'N/A'}
- **Background Image**: ${testResults.tests['2n1-view']?.backgroundImage || 'N/A'}
- **Button Text**: "${testResults.tests['2n1-view']?.buttonText || 'N/A'}"
- **Ocean Background**: ${testResults.tests['2n1-view']?.hasCorrect2N1Background ? '✅ PASS' : '❌ FAIL'}
- **Text Visible**: ${testResults.tests['2n1-view']?.textVisible ? '✅ PASS' : '❌ FAIL'}
- **Ocean Blue Color**: ${testResults.tests['2n1-view']?.hasCorrectColor ? '✅ PASS' : '❌ FAIL'}
- **Font Size**: ${testResults.tests['2n1-view']?.hasCorrectFontSize ? '✅ PASS' : '❌ FAIL'}
- **Glow Animation**: ${testResults.tests['2n1-view']?.hasGlowAnimation ? '✅ PASS' : '❌ FAIL'}
- **Button Text "Main"**: ${testResults.tests['2n1-view']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

### 3. Return to Default Test
- **Status**: ${testResults.tests['return-to-default']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['return-to-default']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['return-to-default']?.screenshot || 'N/A'}
- **Background Image**: ${testResults.tests['return-to-default']?.backgroundImage || 'N/A'}
- **Button Text**: "${testResults.tests['return-to-default']?.buttonText || 'N/A'}"
- **Correct Background**: ${testResults.tests['return-to-default']?.hasCorrectDefaultBackground ? '✅ PASS' : '❌ FAIL'}
- **Text Hidden**: ${testResults.tests['return-to-default']?.textHidden ? '✅ PASS' : '❌ FAIL'}
- **Button Text Restored**: ${testResults.tests['return-to-default']?.hasCorrectButtonText ? '✅ PASS' : '❌ FAIL'}

### 4. Animation and Style Test
- **Status**: ${testResults.tests['animation-style']?.status || 'NOT RUN'}
- **Duration**: ${testResults.tests['animation-style']?.duration || 0}ms
- **Screenshot**: ${testResults.tests['animation-style']?.screenshot || 'N/A'}
- **Glow Animation**: ${testResults.tests['animation-style']?.hasGlowAnimation ? '✅ PASS' : '❌ FAIL'}
- **Position Stable**: ${testResults.tests['animation-style']?.positionStable ? '✅ PASS' : '❌ FAIL'}
- **Smooth Transitions**: ${testResults.tests['animation-style']?.hasSmoothTransitions ? '✅ PASS' : '❌ FAIL'}

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

### Generated Screenshots:
- **test-default-power-infrastructure.png** - Default view with Power.png background
- **test-2n1-ocean-background.png** - 2N+1 view with ocean background
- **test-return-to-default.png** - Return to default view
- **test-animation-effects.png** - Animation and style verification

---

## Success Criteria Analysis
${testResults.failedTests.length === 0 ? `
✅ **ALL SUCCESS CRITERIA MET:**
- Power_2N1.PNG shows ocean/coastal scenery (not power infrastructure)
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
    const reportPath = path.join(SCREENSHOT_DIR, 'critical-requirements-test-report.md');
    fs.writeFileSync(reportPath, reportContent);
    
    console.log('🎯 CRITICAL REQUIREMENTS TEST COMPLETED');
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