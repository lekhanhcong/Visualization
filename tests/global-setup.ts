import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Start the dev server before running tests
  console.log('🚀 Starting development server for cross-browser testing...');
  
  // Check if server is already running
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Development server is already running');
      return;
    }
  } catch {
    // Server not running, we'll need to start it
  }
  
  console.log('⚠️  Development server not detected. Please ensure it\'s running with: npm run dev');
  console.log('   Tests will proceed assuming server is available...');
}

export default globalSetup;