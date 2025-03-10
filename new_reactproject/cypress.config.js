import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL of your app to simplify visit commands
    baseUrl: 'http://localhost:5173', // Adjust to your local app's URL

    // Global timeouts for commands and assertions
    defaultCommandTimeout: 10000, // Timeout for commands (e.g., cy.get, cy.click)
    requestTimeout: 15000, // Timeout for network requests
    responseTimeout: 15000, // Timeout for network responses

    // Retries configuration (helpful for flaky tests)
    retries: {
      runMode: 2, // Retries the test up to 2 times if it fails in run mode
      openMode: 0, // Does not retry in open mode (UI mode)
    },

    // Event listeners setup (e.g., modifying configuration or logging)
    setupNodeEvents(on, config) {
      // Here you can add custom logic for event listeners
      // Example: You can log the test config before each run
      on('before:run', () => {
        console.log('Test is about to run');
      });

      // Return the config object to ensure Cypress is properly configured
      return config;
    },

    // Clearing cookies and local storage to ensure clean state before each test
    clearCookies: true,
    clearLocalStorage: true,

    // Customizing viewport (optional for mobile or desktop simulation)
    viewportWidth: 1280,
    viewportHeight: 720,

    // Browser settings (default is Chrome)
    browser: 'chrome', // You can specify 'chrome', 'firefox', etc. (if installed)
  },
});
