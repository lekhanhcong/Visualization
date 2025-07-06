import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * Cleans up test environment and resources
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up any test artifacts
    console.log('📁 Cleaning up test artifacts...');
    
    // Reset environment variables if needed
    if (process.env.TEST_MODE) {
      delete process.env.TEST_MODE;
      console.log('✅ Test environment variables cleaned');
    }
    
    // Additional cleanup can be added here
    console.log('🎉 Global teardown completed successfully!');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;