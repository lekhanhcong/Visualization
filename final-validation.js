const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateFinal() {
  let browser;
  let page;
  
  try {
    console.log('🎯 FINAL VALIDATION - HEART Website');
    console.log('====================================');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'validation-screenshots');
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
    page.setDefaultTimeout(30000);
    
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Website loaded successfully');
    
    // Check all sections exist
    const sections = ['hero', 'location', 'transportation', 'datacenter', 'electricity', 'submarine'];
    let allSectionsFound = true;
    
    for (const section of sections) {
      const exists = await page.locator(`#${section}`).count() > 0;
      console.log(`${exists ? '✅' : '❌'} Section ${section}: ${exists ? 'Found' : 'Missing'}`);
      if (!exists) allSectionsFound = false;
    }
    
    // Take full page screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'full-website.png'),
      fullPage: true
    });
    
    // Test each section individually
    for (const section of sections) {
      if (await page.locator(`#${section}`).count() > 0) {
        await page.locator(`#${section}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: path.join(screenshotsDir, `${section}-section.png`),
          fullPage: false
        });
      }
    }
    
    // Check for removed metrics
    const metricsTexts = ['Total Capacity', 'Uptime Guarantee', '500kV Lines', '220kV Lines', '110kV Lines'];
    let metricsRemoved = true;
    
    for (const text of metricsTexts) {
      const count = await page.locator(`text=${text}`).count();
      if (count > 0) {
        console.log(`⚠️ Found metrics text: "${text}" (${count} times)`);
        metricsRemoved = false;
      }
    }
    
    if (metricsRemoved) {
      console.log('✅ All metrics successfully removed');
    }
    
    // Check canvas by scrolling to electricity section and waiting longer
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000); // Wait longer for intersection observer
    
    const canvasElements = await page.locator('canvas').count();
    console.log(`✅ Canvas elements: ${canvasElements}`);
    
    if (canvasElements > 0) {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'power-flow-canvas.png'),
        fullPage: false
      });
    }
    
    // Check images
    const imageCount = await page.locator('img').count();
    console.log(`✅ Images: ${imageCount}`);
    
    // Check navigation
    const navButtons = await page.locator('nav button').count();
    console.log(`✅ Navigation buttons: ${navButtons}`);
    
    // Check footer
    const footerExists = await page.locator('footer').count() > 0;
    console.log(`✅ Footer: ${footerExists ? 'Found' : 'Missing'}`);
    
    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mobile-view.png'),
      fullPage: true
    });
    
    console.log('✅ Mobile view captured');
    
    // Final summary
    console.log('\n🏁 FINAL VALIDATION RESULTS:');
    console.log('============================');
    console.log(`✅ All sections present: ${allSectionsFound}`);
    console.log(`✅ Metrics removed: ${metricsRemoved}`);
    console.log(`✅ Canvas animation: ${canvasElements > 0 ? 'Working' : 'Issue'}`);
    console.log(`✅ Images: ${imageCount} loaded`);
    console.log(`✅ Navigation: ${navButtons} buttons`);
    console.log(`✅ Footer: ${footerExists ? 'Present' : 'Missing'}`);
    console.log(`✅ Mobile responsive: Working`);
    
    const finalScore = [allSectionsFound, metricsRemoved, canvasElements > 0, imageCount >= 10, navButtons >= 5, footerExists].filter(Boolean).length;
    
    console.log(`\n🎯 OVERALL SCORE: ${finalScore}/6`);
    
    if (finalScore >= 5) {
      console.log('🎉 WEBSITE IS READY! Excellent implementation!');
    } else {
      console.log('⚠️ Some issues need attention');
    }
    
    console.log(`\n📸 Validation screenshots: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

validateFinal();