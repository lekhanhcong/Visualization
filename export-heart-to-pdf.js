const puppeteer = require('puppeteer');
const path = require('path');

async function exportToPDF() {
    console.log('🚀 Starting PDF export...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for better rendering
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });
        
        console.log('📄 Loading page: http://localhost:3000/heart');
        
        // Navigate to the page
        await page.goto('http://localhost:3000/heart', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Generate PDF
        const pdfPath = path.join(__dirname, 'heart-page-export.pdf');
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        console.log(`✅ PDF exported successfully to: ${pdfPath}`);
        
        // Also take a screenshot
        const screenshotPath = path.join(__dirname, 'heart-page-screenshot.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    exportToPDF();
} catch (e) {
    console.log('❌ Puppeteer is not installed!');
    console.log('📦 Please install it first:');
    console.log('   cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation');
    console.log('   npm install puppeteer');
    console.log('\nThen run this script again:');
    console.log('   node export-heart-to-pdf.js');
}
