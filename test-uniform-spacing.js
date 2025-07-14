const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing uniform section spacing...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take full page screenshot to see overall uniform spacing
    await page.screenshot({ 
      path: 'uniform-spacing-full-page.png', 
      fullPage: true
    });
    console.log('Uniform spacing full page screenshot saved');
    
    // Take a few viewport screenshots to check spacing consistency
    const sections = ['HOME', 'LOCATION', 'TRANSPORTATION', 'DATA CENTER ZONES'];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`Testing ${section} section uniform spacing...`);
      
      try {
        await page.click(`nav button:has-text("${section}")`);
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `uniform-spacing-${section.toLowerCase().replace(/\s+/g, '-')}.png`, 
          fullPage: false,
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        console.log(`${section} uniform spacing screenshot saved`);
      } catch (error) {
        console.log(`Could not navigate to ${section}: ${error.message}`);
      }
    }
    
    console.log('✅ Uniform spacing test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();