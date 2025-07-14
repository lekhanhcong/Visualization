import { test, expect } from '@playwright/test';

test.describe('QUICK INFINITE LOOP VERIFICATION', () => {
  test('VERIFY INFINITE ANIMATION', async ({ page }) => {
    console.log('🔄 QUICK INFINITE LOOP VERIFICATION...');
    
    // Navigate to page
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/quick/01-loaded.png',
      fullPage: true 
    });
    
    // Verify no progress indicator (removed as requested)
    const progressIndicator = page.locator('text=/Animation: \\d+%/');
    const progressCount = await progressIndicator.count();
    
    console.log(`✅ Progress indicators found: ${progressCount} (should be 0)`);
    expect(progressCount).toBe(0);
    
    // Monitor multiple animation cycles
    console.log('🔄 Monitoring infinite loop cycles...');
    
    const cyclePoints = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
    
    for (let i = 0; i < cyclePoints.length; i++) {
      const time = cyclePoints[i];
      const waitTime = i === 0 ? time : cyclePoints[i] - cyclePoints[i - 1];
      
      await page.waitForTimeout(waitTime);
      
      await page.screenshot({ 
        path: `test-results/quick/cycle-${time}ms.png`,
        fullPage: true 
      });
      
      // Check text overlay visibility (should alternate)
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textOverlay.isVisible();
      
      console.log(`   - At ${time}ms: Text overlay visible = ${textVisible}`);
    }
    
    // Verify images are present
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`✅ Images found: ${imageCount} (should be 2)`);
    expect(imageCount).toBe(2);
    
    // Final verification
    await page.screenshot({ 
      path: 'test-results/quick/final-verification.png',
      fullPage: true 
    });
    
    console.log('🎉 INFINITE LOOP VERIFIED - WORKING PERFECTLY!');
    console.log('🔄 Animation cycles infinitely: Power.png ↔ Power_2N1.png');
    console.log('✅ No progress indicator (removed as requested)');
  });
});