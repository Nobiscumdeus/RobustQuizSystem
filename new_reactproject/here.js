// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test files location
  testDir: './tests',
  
  // Run tests in parallel for speed
  fullyParallel: true,
  
  // Don't allow .only tests in CI (false for local)
  forbidOnly: false,
  
  // Retry failed tests 0 times locally
  retries: 0,
  
  // Let Playwright decide optimal parallel workers
  workers: undefined,
  
  // Generate HTML report after tests
  reporter: 'html',
  
  // Default settings for all tests
  use: {
    // Your app's URL
    baseURL: 'http://localhost:5173',
    
    // Take screenshots when tests fail
    screenshot: 'only-on-failure',
    
    // Record video when tests fail
    video: 'retain-on-failure',
    
    // Record trace for debugging
    trace: 'on-first-retry',
  },

  // Test in these browsers
  projects: [
    {
      name: 'chromium',  // Chrome/Edge
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',   // Firefox
      use: { ...devices['Desktop Firefox'] },
    },
    // Safari if you need it
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Start your dev server before tests
  webServer: {
    command: 'npm run dev',  // Your dev command
    url: 'http://localhost:5173',  // Wait for this URL
    reuseExistingServer: true,  // Use running server
    timeout: 120 * 1000,  // Wait up to 2 minutes
  },
});