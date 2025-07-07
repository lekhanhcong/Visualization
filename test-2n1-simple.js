const { chromium } = require('playwright');
const fs = require('fs');

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

async function runTest(name, testFn) {
  console.log(`\n🧪 Running: ${name}`);
  const result = {
    name,
    status: 'pending',
    duration: 0,
    error: null,
    details: {}
  };
  
  const startTime = Date.now();
  
  try {
    const details = await testFn();
    result.status = 'passed';
    result.details = details;
    testResults.summary.passed++;
    console.log(`✅ Passed: ${name}`);
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    testResults.summary.failed++;
    console.error(`❌ Failed: ${name}`, error.message);
  }
  
  result.duration = Date.now() - startTime;
  testResults.tests.push(result);
  testResults.summary.total++;
}

async function main() {
  console.log('🚀 Starting 2N+1 Simple Feature Tests');
  console.log('📍 Testing URL: http://localhost:3001');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Initial Page Load
    await runTest('Initial Page Load', async () => {
      console.log('  - Navigating to http://localhost:3001...');
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
      
      console.log('  - Checking page title...');
      const title = await page.title();
      if (!title) throw new Error('Page title is empty');
      
      console.log('  - Verifying default background image...');
      // Wait for the image to be loaded
      await page.waitForSelector('img[alt="Main Power Infrastructure"]', { 
        state: 'visible',
        timeout: 10000 
      });
      const backgroundImage = await page.locator('img[alt="Main Power Infrastructure"]').first();
      const isVisible = await backgroundImage.isVisible();
      if (!isVisible) throw new Error('Default background image not visible');
      
      console.log('  - Checking for 2N+1 button...');
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      const buttonText = await button.textContent();
      if (!buttonText.includes('Show 2N+1 Redundancy')) {
        throw new Error(`Button text incorrect: ${buttonText}`);
      }
      
      console.log('  - Checking button styling...');
      const buttonColor = await button.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      if (!buttonColor.includes('rgb(220, 38, 38)') && !buttonColor.includes('rgb(239, 68, 68)')) {
        console.log(`    Button color: ${buttonColor} (expected red)`);
      }
      
      console.log('  - Checking for console errors...');
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.screenshot({ path: 'test-screenshots/1-initial-state.png' });
      
      return {
        title,
        buttonText,
        backgroundVisible: isVisible,
        consoleErrors
      };
    });
    
    // Test 2: Click to Show 2N+1
    await runTest('Show 2N+1 Redundancy', async () => {
      console.log('  - Clicking 2N+1 button...');
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      await button.click();
      
      console.log('  - Waiting for transition...');
      await page.waitForTimeout(600); // Wait for transition
      
      console.log('  - Verifying 2N+1 background image...');
      const redundancyImage = await page.locator('img[alt="2N+1 Redundancy View"]').first();
      const isVisible = await redundancyImage.isVisible();
      if (!isVisible) throw new Error('2N+1 background image not visible');
      
      console.log('  - Checking for text overlay...');
      const textOverlay = await page.locator('text=500KV ONSITE GRID');
      const overlayVisible = await textOverlay.isVisible();
      if (!overlayVisible) throw new Error('Text overlay "500KV ONSITE GRID" not visible');
      
      console.log('  - Verifying text overlay styling...');
      const overlayElement = await page.locator('div:has-text("500KV ONSITE GRID")').last();
      const overlayStyle = await overlayElement.evaluate(el => ({
        color: window.getComputedStyle(el).color,
        fontSize: window.getComputedStyle(el).fontSize,
        position: {
          left: el.style.left,
          top: el.style.top
        }
      }));
      
      console.log('  - Checking button text change...');
      const buttonText = await button.textContent();
      if (!buttonText.includes('Back to Main')) {
        throw new Error(`Button text incorrect: ${buttonText}`);
      }
      
      await page.screenshot({ path: 'test-screenshots/2-2n1-state.png' });
      
      return {
        redundancyImageVisible: isVisible,
        overlayVisible,
        overlayStyle,
        buttonText
      };
    });
    
    // Test 3: Click to Return
    await runTest('Return to Main View', async () => {
      console.log('  - Clicking Back to Main button...');
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      await button.click();
      
      console.log('  - Waiting for transition...');
      await page.waitForTimeout(600);
      
      console.log('  - Verifying main background restored...');
      const mainImage = await page.locator('img[alt="Main Power Infrastructure"]').first();
      const isVisible = await mainImage.isVisible();
      if (!isVisible) throw new Error('Main background image not restored');
      
      console.log('  - Checking text overlay removed...');
      const textOverlay = await page.locator('text=500KV ONSITE GRID');
      const overlayCount = await textOverlay.count();
      if (overlayCount > 0) throw new Error('Text overlay still visible after returning');
      
      console.log('  - Verifying button text restored...');
      const buttonText = await button.textContent();
      if (!buttonText.includes('Show 2N+1 Redundancy')) {
        throw new Error(`Button text not restored: ${buttonText}`);
      }
      
      await page.screenshot({ path: 'test-screenshots/3-returned-state.png' });
      
      return {
        mainImageVisible: isVisible,
        overlayRemoved: overlayCount === 0,
        buttonText
      };
    });
    
    // Test 4: Multiple Toggle Cycles
    await runTest('Multiple Toggle Cycles', async () => {
      console.log('  - Testing rapid toggle cycles...');
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      
      for (let i = 0; i < 5; i++) {
        console.log(`  - Cycle ${i + 1}: Clicking to show 2N+1...`);
        await button.click();
        await page.waitForTimeout(300);
        
        const redundancyVisible = await page.locator('img[alt="2N+1 Redundancy View"]').isVisible();
        if (!redundancyVisible) throw new Error(`2N+1 view not visible on cycle ${i + 1}`);
        
        console.log(`  - Cycle ${i + 1}: Clicking back to main...`);
        await button.click();
        await page.waitForTimeout(300);
        
        const mainVisible = await page.locator('img[alt="Main Power Infrastructure"]').isVisible();
        if (!mainVisible) throw new Error(`Main view not visible on cycle ${i + 1}`);
      }
      
      return {
        cyclesCompleted: 5,
        finalState: 'main'
      };
    });
    
    // Test 5: Error Detection
    await runTest('Console Error Detection', async () => {
      console.log('  - Monitoring console for errors...');
      const errors = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push({
            text: msg.text(),
            location: msg.location()
          });
        }
      });
      
      // Perform actions that might trigger errors
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      await button.click();
      await page.waitForTimeout(500);
      await button.click();
      await page.waitForTimeout(500);
      
      return {
        errorCount: errors.length,
        errors
      };
    });
    
    // Test 6: Performance Check
    await runTest('Performance and Transitions', async () => {
      console.log('  - Measuring transition performance...');
      
      const button = await page.locator('button[data-testid="simple-redundancy-toggle"]');
      
      // Measure time to switch to 2N+1
      const start2N1 = Date.now();
      await button.click();
      await page.waitForSelector('img[alt="2N+1 Redundancy View"]', { state: 'visible' });
      const time2N1 = Date.now() - start2N1;
      
      await page.waitForTimeout(500);
      
      // Measure time to switch back
      const startMain = Date.now();
      await button.click();
      await page.waitForSelector('img[alt="Main Power Infrastructure"]', { state: 'visible' });
      const timeMain = Date.now() - startMain;
      
      console.log(`  - Transition to 2N+1: ${time2N1}ms`);
      console.log(`  - Transition to Main: ${timeMain}ms`);
      
      return {
        transitionTo2N1: time2N1,
        transitionToMain: timeMain,
        smooth: time2N1 < 1000 && timeMain < 1000
      };
    });
    
  } finally {
    // Generate test report
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed} ✅`);
    console.log(`Failed: ${testResults.summary.failed} ❌`);
    
    // Save detailed report
    fs.writeFileSync(
      'test-2n1-results.json',
      JSON.stringify(testResults, null, 2)
    );
    
    // Generate markdown report
    let markdown = `# 2N+1 Simple Feature Test Report

**Date:** ${new Date().toLocaleString()}
**URL:** http://localhost:3001

## Summary
- **Total Tests:** ${testResults.summary.total}
- **Passed:** ${testResults.summary.passed} ✅
- **Failed:** ${testResults.summary.failed} ❌

## Detailed Results

`;
    
    for (const test of testResults.tests) {
      markdown += `### ${test.name}
- **Status:** ${test.status === 'passed' ? '✅ Passed' : '❌ Failed'}
- **Duration:** ${test.duration}ms
`;
      
      if (test.error) {
        markdown += `- **Error:** ${test.error}\n`;
      }
      
      if (test.details && Object.keys(test.details).length > 0) {
        markdown += '- **Details:**\n';
        for (const [key, value] of Object.entries(test.details)) {
          markdown += `  - ${key}: ${JSON.stringify(value)}\n`;
        }
      }
      
      markdown += '\n';
    }
    
    markdown += `## Screenshots
- Initial State: [test-screenshots/1-initial-state.png](test-screenshots/1-initial-state.png)
- 2N+1 State: [test-screenshots/2-2n1-state.png](test-screenshots/2-2n1-state.png)
- Returned State: [test-screenshots/3-returned-state.png](test-screenshots/3-returned-state.png)
`;
    
    fs.writeFileSync('test-2n1-report.md', markdown);
    
    console.log('\n✅ Test reports saved:');
    console.log('   - test-2n1-results.json');
    console.log('   - test-2n1-report.md');
    console.log('   - test-screenshots/');
    
    await browser.close();
  }
}

main().catch(console.error);