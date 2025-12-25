import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark themes', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')

    // Wait for the theme toggle button to be visible
    const themeToggle = page.locator('[data-slot="theme-toggler-button"]')
    await expect(themeToggle).toBeVisible()

    // Get initial state
    const initialClass = await page.locator('html').getAttribute('class')
    const initialIcon = themeToggle.locator('svg')

    // Check initial icon (should be Sun for light theme - 8 paths for rays)
    await expect(initialIcon.locator('path')).toHaveCount(8)

    // Click to toggle (system -> light, no change visually)
    await themeToggle.click()
    await page.waitForTimeout(100)

    // Click again to toggle to dark
    await themeToggle.click()
    await page.waitForTimeout(100)

    // Check dark theme applied
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Check icon changed to Moon (1 path)
    await expect(themeToggle.locator('svg path')).toHaveCount(1)

    // Click again to toggle back to light
    await themeToggle.click()

    // Wait for transition
    await page.waitForTimeout(100)

    // Check light theme applied (dark class removed)
    const finalClass = await page.locator('html').getAttribute('class')
    expect(finalClass).not.toContain('dark')

    // Check icon back to Sun (8 paths)
    await expect(themeToggle.locator('svg path')).toHaveCount(8)
  })
})
