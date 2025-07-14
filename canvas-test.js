const { chromium } = require('playwright');

async function testCanvas() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    
    // Scroll to electricity section
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000);
    
    // Check for canvas
    const canvas = await page.locator('canvas');
    const canvasCount = await canvas.count();
    
    console.log(`Canvas elements found: ${canvasCount}`);
    
    if (canvasCount > 0) {
      const isVisible = await canvas.first().isVisible();
      console.log(`Canvas visible: ${isVisible}`);
      
      if (isVisible) {
        const boundingBox = await canvas.first().boundingBox();
        console.log('Canvas bounding box:', boundingBox);
      }
    }
    
    await page.screenshot({ path: 'canvas-debug.png' });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testCanvas();