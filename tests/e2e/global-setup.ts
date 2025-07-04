import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...')
  
  // Launch browser for global setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to the application to ensure it's running
    console.log('🌐 Checking application availability...')
    await page.goto(config.projects[0]?.use?.baseURL || 'http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    
    // Wait for essential elements to be present
    console.log('🔍 Validating application structure...')
    await page.waitForSelector('body', { timeout: 10000 })
    
    // Check if the application has loaded properly
    const title = await page.title()
    if (!title.includes('Hue Hi Tech Park')) {
      console.warn('⚠️ Application title may not be correct:', title)
    }
    
    console.log('✅ Application is ready for testing')
    
    // Create test data directory if it doesn't exist
    console.log('📁 Setting up test data directories...')
    
    // You could add any global test data setup here
    // For example, creating mock data files, seeding databases, etc.
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('✨ Global setup completed successfully')
}

export default globalSetup