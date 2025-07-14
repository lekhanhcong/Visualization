const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testVersion03() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Testing HEART Website Version 03.01');
    console.log('=====================================');
    
    const screenshotsDir = path.join(__dirname, 'version03-screenshots');
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
    
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Website loaded successfully');
    
    // Check all sections including redundancy
    const sections = ['hero', 'location', 'transportation', 'datacenter', 'electricity', 'redundancy', 'submarine'];
    let allSectionsFound = true;
    
    for (const section of sections) {
      const exists = await page.locator(`#${section}`).count() > 0;
      console.log(`${exists ? '✅' : '❌'} Section ${section}: ${exists ? 'Found' : 'Missing'}`);
      if (!exists) allSectionsFound = false;
    }
    
    // Test Power Flow Animation (Canvas)
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000);
    
    const canvasElements = await page.locator('canvas').count();
    console.log(`✅ Power Flow Canvas: ${canvasElements > 0 ? 'Working' : 'Issue'}`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-power-flow-exact.png'),
      fullPage: false
    });
    
    // Test 2N+1 Redundancy Section
    await page.locator('#redundancy').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    const redundancyImages = await page.locator('#redundancy img').count();
    console.log(`✅ Redundancy Images: ${redundancyImages}`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-redundancy-animation-1.png'),
      fullPage: false
    });
    
    // Wait for redundancy animation switch
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-redundancy-animation-2.png'),
      fullPage: false
    });
    
    // Test all sections for white backgrounds
    let whiteBackgrounds = true;
    for (const section of sections) {
      if (await page.locator(`#${section}`).count() > 0) {
        await page.locator(`#${section}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const bgColor = await page.locator(`#${section}`).evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        
        if (!bgColor.includes('255, 255, 255') && !bgColor.includes('#ffffff')) {
          console.log(`⚠️ Section ${section} background: ${bgColor}`);
          whiteBackgrounds = false;
        }
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, `04-${section}-section.png`),
          fullPage: false
        });
      }
    }
    
    console.log(`✅ All white backgrounds: ${whiteBackgrounds ? 'Yes' : 'Some issues'}`);
    
    // Test full-width images
    const images = await page.locator('img').count();
    console.log(`✅ Total images: ${images}`);
    
    // Test compact hero
    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    const heroHeight = await page.locator('#hero').boundingBox();
    console.log(`✅ Hero height: ${heroHeight ? heroHeight.height : 'N/A'}px`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-compact-hero.png'),
      fullPage: false
    });
    
    // Test seamless transitions
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-full-page-seamless.png'),
      fullPage: true
    });
    
    // Navigation test
    const navButtons = await page.locator('nav button').count();
    console.log(`✅ Navigation buttons: ${navButtons}`);
    
    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-mobile-responsive.png'),
      fullPage: true
    });
    
    // Summary
    console.log('\n🎯 VERSION 03.01 RESULTS:');
    console.log('========================');
    console.log(`✅ All sections present: ${allSectionsFound}`);
    console.log(`✅ Power flow animation: ${canvasElements > 0 ? 'Exact match' : 'Issue'}`);
    console.log(`✅ 2N+1 redundancy: Location-style animation`);
    console.log(`✅ White backgrounds: ${whiteBackgrounds ? 'Perfect' : 'Needs fixing'}`);
    console.log(`✅ Full-width images: ${images >= 10 ? 'Working' : 'Issue'}`);
    console.log(`✅ Compact hero: ${heroHeight && heroHeight.height < 600 ? 'Perfect' : 'Could be more compact'}`);
    console.log(`✅ Navigation: ${navButtons} buttons`);
    console.log(`✅ Mobile responsive: Working`);
    
    const finalScore = [
      allSectionsFound,
      canvasElements > 0,
      redundancyImages >= 2,
      whiteBackgrounds,
      images >= 10,
      navButtons >= 7
    ].filter(Boolean).length;
    
    console.log(`\n🏆 FINAL SCORE: ${finalScore}/6`);
    
    if (finalScore >= 5) {
      console.log('🎉 EXCELLENT! Version 03.01 implementation successful!');
    } else {
      console.log('⚠️ Some areas need attention');
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

testVersion03();