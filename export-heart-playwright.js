const { chromium } = require('playwright');
const path = require('path');

async function exportHeartPageToPDF() {
    console.log('🚀 Starting HEART page PDF export...');
    console.log('📍 URL: http://localhost:3000/heart');
    
    const browser = await chromium.launch({
        headless: true
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        
        console.log('⏳ Loading page...');
        
        // Navigate to the page
        await page.goto('http://localhost:3000/heart', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // Wait for animations to complete
        await page.waitForTimeout(5000);
        
        // Generate timestamp for filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        // Save PDF
        const pdfPath = path.join(__dirname, `HEART-page-${timestamp}.pdf`);
        await page.pdf({
            path: pdfPath,
            format: 'A3', // Use A3 for better landscape view
            landscape: true,
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            scale: 0.8
        });
        
        console.log(`✅ PDF saved to: ${pdfPath}`);
        
        // Also save a high-quality screenshot
        const screenshotPath = path.join(__dirname, `HEART-page-${timestamp}.png`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        
        // Print page info
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure the dev server is running: npm run dev');
        console.log('2. Check if http://localhost:3000/heart is accessible');
        console.log('3. Try again after the page loads completely');
    } finally {
        await browser.close();
        console.log('\n✨ Process completed!');
    }
}

// Check if playwright is available
try {
    require.resolve('playwright');
    exportHeartPageToPDF();
} catch (e) {
    console.log('❌ Playwright is not installed!');
    console.log('\n📦 Installing Playwright...');
    console.log('Please run:');
    console.log('   cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation/hue-datacenter-visualization');
    console.log('   npm install playwright');
    console.log('\nOr use the manual method below 👇');
    console.log('\n📋 Manual PDF Export:');
    console.log('1. Open http://localhost:3000/heart in Chrome');
    console.log('2. Press Cmd+P (Print)');
    console.log('3. Choose "Save as PDF"');
    console.log('4. Select "A3" or "A4" size');
    console.log('5. Enable "Background graphics"');
    console.log('6. Save the PDF');
}
