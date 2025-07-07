import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/2n1-report' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices.chromium },
    },
  ],
  
  // No webServer - assuming server is already running on port 3001
});