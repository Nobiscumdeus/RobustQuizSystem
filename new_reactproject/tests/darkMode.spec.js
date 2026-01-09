
// tests/darkmode.spec.js
import { test, expect } from '@playwright/test';

test.describe('Dark Mode on Homepage', () => {
  test('should apply dark mode styles when toggled', async ({ page }) => {
    await page.goto('/');

    // Toggle dark mode (find dark mode button in header)
    const darkModeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await darkModeButton.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Check dark mode is applied to homepage sections
    const heroSection = page.locator('section').first();
    const heroBgColor = await heroSection.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Dark mode should have dark gray/blue background
    const isDarkMode = heroBgColor.includes('rgb(17, 24, 39)') || // gray-900
                       heroBgColor.includes('rgb(30, 58, 138)'); // blue-900
    
    expect(isDarkMode).toBe(true);
  });
});