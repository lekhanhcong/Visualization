const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing reduced section spacing...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take full page screenshot to see overall spacing
    await page.screenshot({ 
      path: 'reduced-spacing-full-page.png', 
      fullPage: true
    });
    console.log('Full page spacing screenshot saved: reduced-spacing-full-page.png');
    
    // Take viewport screenshots of different sections
    const sections = ['HOME', 'LOCATION', 'TRANSPORTATION', 'DATA CENTER ZONES', 'ELECTRICITY', '2N+1 REDUNDANCY', 'SUBMARINE CABLE'];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`Testing ${section} section spacing...`);
      
      try {
        await page.click(`nav button:has-text("${section}")`);
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `spacing-${section.toLowerCase().replace(/\s+/g, '-')}.png`, 
          fullPage: false,
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        console.log(`${section} spacing screenshot saved`);
      } catch (error) {
        console.log(`Could not navigate to ${section}: ${error.message}`);
      }
    }
    
    console.log('✅ Spacing reduction test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();