// tests/homepage.spec.js
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h2')).toContainText('QuizMaster - Digital Examination Platform');
    
    // Check subtitle
    await expect(page.locator('p').first()).toContainText('Choose your path below');
  });

  test('should have two path options for users', async ({ page }) => {
    await page.goto('/');
    
    // Check both path sections exist
    const studentPath = page.locator('text=Taking an Exam?');
    const examinerPath = page.locator('text=Creating Exams?');
    
    await expect(studentPath).toBeVisible();
    await expect(examinerPath).toBeVisible();
    
    // Check student path links
    const tryQuizLink = page.locator('a[href="/quiz_demo"]');
    const studentLoginLink = page.locator('a[href="/student_exam_login"]');
    
    await expect(tryQuizLink).toHaveText('Try Sample Quiz');
    await expect(studentLoginLink).toHaveText('Student Login');
    
    // Check examiner path links
    const examinerLoginLink = page.locator('a[href="/login"]');
    const createAccountLink = page.locator('a[href="/register"]');
    
    await expect(examinerLoginLink).toHaveText('Examiner Login');
    await expect(createAccountLink).toHaveText('Create Account');
  });

  test('should have featured courses section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to courses section
    const coursesTitle = page.locator('h3:has-text("Featured Courses")');
    await coursesTitle.scrollIntoViewIfNeeded();
    
    await expect(coursesTitle).toBeVisible();
    
    // Check courses are displayed
    const courses = page.locator('div.grid').first();
    await expect(courses).toBeVisible();
    
    // Check specific courses
    await expect(page.locator('text=Anatomy')).toBeVisible();
    await expect(page.locator('text=Statistics')).toBeVisible();
    await expect(page.locator('text=Pharmacology')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test Try Sample Quiz link
    await page.click('a[href="/quiz_demo"]');
    await expect(page).toHaveURL(/.*quiz_demo/);
    
    // Go back and test another link
    await page.goBack();
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should have testimonials section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to testimonials
    const testimonialsTitle = page.locator('h3:has-text("What Our Users Say")');
    await testimonialsTitle.scrollIntoViewIfNeeded();
    
    await expect(testimonialsTitle).toBeVisible();
    
    // Check testimonial content
    await expect(page.locator('text=This platform has improved my learning experience!')).toBeVisible();
    await expect(page.locator('text=Rachel Adebola')).toBeVisible();
  });

  test('should have how it works section', async ({ page }) => {
    await page.goto('/');
    
    const howItWorks = page.locator('h3:has-text("How It Works")');
    await howItWorks.scrollIntoViewIfNeeded();
    
    await expect(howItWorks).toBeVisible();
    
    // Check steps
    await expect(page.locator('text=1. Sign up for an account.')).toBeVisible();
    await expect(page.locator('text=2. Choose a course.')).toBeVisible();
    await expect(page.locator('text=3. Take quizzes to assess your knowledge.')).toBeVisible();
  });
});
