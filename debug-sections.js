const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Debugging section overlap issue...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check 2N+1 Redundancy section
    console.log('Navigating to 2N+1 Redundancy section...');
    await page.click('nav button:has-text("2N+1 REDUNDANCY")');
    await page.waitForTimeout(3000);
    
    // Get section content info
    const redundancySection = await page.locator('#redundancy').first();
    if (redundancySection) {
      console.log('2N+1 Redundancy section found');
      
      // Check what images are in this section
      const images = await redundancySection.locator('img').all();
      console.log(`Found ${images.length} images in redundancy section`);
      
      for (let i = 0; i < images.length; i++) {
        const src = await images[i].getAttribute('src');
        console.log(`Redundancy image ${i + 1}: ${src}`);
      }
    }
    
    await page.screenshot({ 
      path: 'debug-redundancy-only.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    
    // Check Submarine Cable section
    console.log('Navigating to Submarine Cable section...');
    await page.click('nav button:has-text("SUBMARINE CABLE")');
    await page.waitForTimeout(3000);
    
    const submarineSection = await page.locator('#submarine').first();
    if (submarineSection) {
      console.log('Submarine Cable section found');
      
      // Check what images are in this section
      const images = await submarineSection.locator('img').all();
      console.log(`Found ${images.length} images in submarine section`);
      
      for (let i = 0; i < images.length; i++) {
        const src = await images[i].getAttribute('src');
        console.log(`Submarine image ${i + 1}: ${src}`);
      }
    }
    
    await page.screenshot({ 
      path: 'debug-submarine-only.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
})();