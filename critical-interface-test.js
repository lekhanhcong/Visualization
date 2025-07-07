const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'critical-verification');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshot(page, name, description) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ 
    path: filepath,
    fullPage: true 
  });
  console.log(`📸 ${description} - ${filename}`);
  return filename;
}

async function runCriticalInterfaceTest() {
  console.log('🔍 CRITICAL INTERFACE VERIFICATION TEST');
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // ===== TEST 1: Clean Interface Test =====
    console.log('\n🧹 TEST 1: Clean Interface Verification');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check for unwanted elements
    const statusBadge = await page.locator('[data-testid*="status"], .status-badge, .badge').count();
    const legendPanel = await page.locator('[data-testid*="legend"], .legend-panel, .legend').count();
    
    console.log(`❌ Status badges found: ${statusBadge}`);
    console.log(`❌ Legend panels found: ${legendPanel}`);
    
    // Capture clean interface
    await captureScreenshot(page, 'test-clean-interface', 'Clean interface verification');
    
    // ===== TEST 2: 2N+1 Text Improvements =====
    console.log('\n✨ TEST 2: 2N+1 Text Improvements');
    
    // Find and click the redundancy button
    const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    const buttonExists = await redundancyButton.isVisible();
    
    if (buttonExists) {
      console.log('✅ Found redundancy button');
      
      // Click to show 2N+1 redundancy
      await redundancyButton.click();
      console.log('🔄 Clicked "Show 2N+1 Redundancy"');
      
      // Wait for animation to start
      await page.waitForTimeout(1000);
      
      // Capture during animation
      await captureScreenshot(page, 'test-impressive-text-animation', 'During text animation');
      
      // Wait for animation to complete
      await page.waitForTimeout(2000);
      
      // Capture final state
      await captureScreenshot(page, 'test-bright-text-final', 'Final bright text state');
      
      // Check for the text element
      const textElement = page.locator('text=500KV ONSITE GRID');
      const textVisible = await textElement.isVisible();
      
      console.log(`📄 "500KV ONSITE GRID" text visible: ${textVisible}`);
      
      if (textVisible) {
        // Get text styling information
        const textStyling = await textElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            textShadow: styles.textShadow,
            boxShadow: styles.boxShadow,
            opacity: styles.opacity,
            background: styles.background,
            position: styles.position,
            zIndex: styles.zIndex,
            transform: styles.transform,
            animation: styles.animation
          };
        });
        
        console.log('🎨 Text styling:', textStyling);
        
        // Check for proper styling
        const hasBlueText = textStyling.color.includes('rgb(0, 102, 204)') || 
                          textStyling.color.includes('#0066CC') ||
                          textStyling.color.includes('rgb(0, 102, 204)');
        
        const hasBrightBackground = textStyling.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                                  textStyling.background.includes('gradient') ||
                                  textStyling.background.includes('white') ||
                                  textStyling.background.includes('blue');
        
        console.log(`🔵 Has ocean blue text: ${hasBlueText}`);
        console.log(`⚪ Has bright background: ${hasBrightBackground}`);
        console.log(`✨ Has animations: ${textStyling.animation !== 'none'}`);
        
        // ===== TEST 3: Animation Verification =====
        console.log('\n🎬 TEST 3: Animation Verification');
        
        // Toggle back to check smooth transitions
        await redundancyButton.click();
        await page.waitForTimeout(1000);
        
        // Toggle again to see fade-in effect
        await redundancyButton.click();
        await page.waitForTimeout(500);
        
        // Capture animation sequence
        await captureScreenshot(page, 'test-animation-sequence', 'Animation sequence verification');
        
        await page.waitForTimeout(2000);
        
        // ===== TEST 4: Background Verification =====
        console.log('\n🌊 TEST 4: Background Verification');
        
        // Check for ocean background image
        const backgroundImages = await page.evaluate(() => {
          const images = document.querySelectorAll('img');
          return Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt,
            displayed: img.style.display !== 'none' && img.offsetWidth > 0
          }));
        });
        
        const oceanBackground = backgroundImages.find(img => 
          img.src.includes('Power_2N1') || img.src.includes('2N1')
        );
        
        console.log(`🌊 Ocean background found: ${!!oceanBackground}`);
        console.log('🖼️ All images:', backgroundImages);
        
        // Test "Main" toggle
        const mainButton = page.locator('text=Main');
        const mainButtonExists = await mainButton.isVisible();
        
        if (mainButtonExists) {
          console.log('✅ Found "Main" button');
          await mainButton.click();
          await page.waitForTimeout(1000);
          
          // Capture return to main view
          await captureScreenshot(page, 'test-main-view-return', 'Return to main view');
        }
        
      } else {
        console.log('❌ "500KV ONSITE GRID" text not found');
      }
      
    } else {
      console.log('❌ Redundancy button not found');
    }
    
    // ===== FINAL VERIFICATION =====
    console.log('\n🔍 FINAL VERIFICATION');
    
    // Check final state
    const finalStatusBadge = await page.locator('[data-testid*="status"], .status-badge, .badge').count();
    const finalLegendPanel = await page.locator('[data-testid*="legend"], .legend-panel, .legend').count();
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`❌ Status badges: ${finalStatusBadge} (should be 0)`);
    console.log(`❌ Legend panels: ${finalLegendPanel} (should be 0)`);
    
    if (finalStatusBadge === 0 && finalLegendPanel === 0) {
      console.log('✅ CLEAN INTERFACE VERIFIED');
    } else {
      console.log('❌ INTERFACE NOT CLEAN');
    }
    
    // Final comprehensive screenshot
    await captureScreenshot(page, 'test-final-comprehensive', 'Final comprehensive state');
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await browser.close();
    console.log('\n🎉 Critical Interface Test Complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
  }
}

// Run the test
runCriticalInterfaceTest().catch(console.error);