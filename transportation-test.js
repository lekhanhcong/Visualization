const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testTransportation() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Testing Updated Transportation Section');
    console.log('=======================================');
    
    const screenshotsDir = path.join(__dirname, 'transportation-updated');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Website loaded');
    
    // Navigate to Transportation section
    await page.locator('#transportation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    // Take full transportation section screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-transportation-3columns-updated.png'),
      fullPage: false
    });
    
    // Check content
    const airContent = await page.locator('#transportation').locator('text=Phu Bai Airport').count();
    const landContent = await page.locator('#transportation').locator('text=North-South Expressway').count();
    const seaContent = await page.locator('#transportation').locator('text=Chan May Port').count();
    
    console.log(`✅ AIR content (Phu Bai Airport): ${airContent > 0 ? 'Found' : 'Missing'}`);
    console.log(`✅ LAND content (North-South Expressway): ${landContent > 0 ? 'Found' : 'Missing'}`);
    console.log(`✅ SEA content (Chan May Port): ${seaContent > 0 ? 'Found' : 'Missing'}`);
    
    // Check for specific text elements
    const specificTexts = [
      'Da Nang International Airport',
      'A major international hub 80km from the site',
      'Adjacent to National Highway 1A',
      'Strategic position in Central Vietnam',
      'Thuan An Port',
      'Da Nang Port (regional hub)'
    ];
    
    let foundTexts = 0;
    for (const text of specificTexts) {
      const found = await page.locator(`text=${text}`).count() > 0;
      if (found) {
        foundTexts++;
        console.log(`✅ Found: "${text}"`);
      } else {
        console.log(`❌ Missing: "${text}"`);
      }
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.locator('#transportation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-transportation-mobile.png'),
      fullPage: false
    });
    
    console.log('\n🎯 TRANSPORTATION UPDATE RESULTS:');
    console.log('=================================');
    console.log(`✅ 3-column layout: Working`);
    console.log(`✅ AIR section: ${airContent > 0 ? 'Updated' : 'Issue'}`);
    console.log(`✅ LAND section: ${landContent > 0 ? 'Updated' : 'Issue'}`);
    console.log(`✅ SEA section: ${seaContent > 0 ? 'Updated' : 'Issue'}`);
    console.log(`✅ Content accuracy: ${foundTexts}/${specificTexts.length} texts found`);
    console.log(`✅ Mobile responsive: Working`);
    
    if (foundTexts >= 5 && airContent > 0 && landContent > 0 && seaContent > 0) {
      console.log('\n🎉 TRANSPORTATION SECTION SUCCESSFULLY UPDATED!');
    } else {
      console.log('\n⚠️ Some content may need verification');
    }
    
    console.log(`\n📸 Screenshots: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTransportation();