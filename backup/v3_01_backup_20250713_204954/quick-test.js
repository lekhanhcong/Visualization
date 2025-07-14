const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
  
  // Check for button
  const buttonText = await page.locator('button').allTextContents();
  console.log('Buttons found:', buttonText);
  
  // Check for any redundancy-related elements
  const redundancyElements = await page.locator('*:has-text("redundancy")').count();
  console.log('Elements with "redundancy" text:', redundancyElements);
  
  // Check page HTML for debugging
  const htmlContent = await page.content();
  const hasRedundancyInHTML = htmlContent.toLowerCase().includes('redundancy');
  console.log('HTML contains "redundancy":', hasRedundancyInHTML);
  
  // Check for the specific button
  const redundancyButton = await page.locator('button:has-text("Show 2N+1 Redundancy")').count();
  console.log('Redundancy button found:', redundancyButton > 0);
  
  await browser.close();
})();