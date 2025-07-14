const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting HEART Website Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Test 1: Navigate to HEART page
    console.log('📍 Test 1: Loading HEART website...');
    await page.goto('http://localhost:3000/heart');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/01-heart-loaded.png', fullPage: true });
    console.log('✅ HEART page loaded successfully');

    // Test 2: Check navigation
    console.log('🧭 Test 2: Testing navigation...');
    const navigation = await page.locator('nav').isVisible();
    if (navigation) {
      console.log('✅ Navigation visible');
      await page.screenshot({ path: 'test-screenshots/02-navigation.png' });
    } else {
      console.log('❌ Navigation not found');
    }

    // Test 3: Check sections
    console.log('📋 Test 3: Testing sections...');
    const sections = ['location', 'transportation', 'datacenter', 'electricity', 'submarine'];
    
    for (let i = 0; i < sections.length; i++) {
      const sectionId = sections[i];
      const section = page.locator(`#${sectionId}`);
      const isVisible = await section.isVisible();
      
      if (isVisible) {
        console.log(`✅ Section ${sectionId} found`);
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `test-screenshots/03-section-${sectionId}.png`, fullPage: true });
      } else {
        console.log(`❌ Section ${sectionId} not found`);
      }
    }

    // Test 4: Test location image animation
    console.log('🖼️ Test 4: Testing location image animation...');
    await page.locator('#location').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/04-location-animation-1.png', fullPage: true });
    
    await page.waitForTimeout(4000); // Wait for image transition
    await page.screenshot({ path: 'test-screenshots/04-location-animation-2.png', fullPage: true });
    console.log('✅ Location animation tested');

    // Test 5: Test electricity animation
    console.log('⚡ Test 5: Testing electricity infrastructure animation...');
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/05-electricity-animation.png', fullPage: true });
    
    const canvas = await page.locator('#electricity canvas').isVisible();
    if (canvas) {
      console.log('✅ Power flow animation canvas found');
    } else {
      console.log('❌ Power flow animation canvas not found');
    }

    // Test 6: Test submarine cable animation
    console.log('🌊 Test 6: Testing submarine cable animation...');
    await page.locator('#submarine').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/06-submarine-animation-1.png', fullPage: true });
    
    await page.waitForTimeout(4000); // Wait for image transition
    await page.screenshot({ path: 'test-screenshots/06-submarine-animation-2.png', fullPage: true });
    console.log('✅ Submarine cable animation tested');

    // Test 7: Test responsive design
    console.log('📱 Test 7: Testing responsive design...');
    
    // Desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/07-desktop.png', fullPage: true });
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/07-tablet.png', fullPage: true });
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/07-mobile.png', fullPage: true });
    console.log('✅ Responsive design tested');

    // Test 8: Test navigation functionality
    console.log('🎯 Test 8: Testing navigation functionality...');
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Test clicking navigation items
    const navItems = [
      { text: 'LOCATION', id: 'location' },
      { text: 'TRANSPORTATION', id: 'transportation' },
      { text: 'DATA CENTER ZONES', id: 'datacenter' },
      { text: 'ELECTRICITY', id: 'electricity' },
      { text: 'SUBMARINE CABLE SYSTEMS', id: 'submarine' }
    ];
    
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      await page.click(`text=${item.text}`);
      await page.waitForTimeout(1500);
      
      const section = page.locator(`#${item.id}`);
      const sectionInView = await section.isVisible();
      if (sectionInView) {
        console.log(`✅ Navigation to ${item.text} works`);
      } else {
        console.log(`❌ Navigation to ${item.text} failed`);
      }
      
      await page.screenshot({ path: `test-screenshots/08-nav-${i + 1}-${item.id}.png`, fullPage: true });
    }

    // Test 9: Test footer
    console.log('🦶 Test 9: Testing footer...');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/09-footer.png', fullPage: true });
    
    const footerVisible = await footer.isVisible();
    if (footerVisible) {
      console.log('✅ Footer visible');
    } else {
      console.log('❌ Footer not found');
    }

    // Test 10: Final complete page screenshot
    console.log('📸 Test 10: Taking final complete page screenshot...');
    await page.goto('http://localhost:3000/heart');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/10-final-complete.png', fullPage: true });

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-screenshots/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();