import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',

  // News portals hit APIs & CDNs => allow more time
  timeout: 60 * 1000,

  expect: {
    timeout: 10 * 1000,
  },

  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: [['html'], ['list']],

  use: {
    /**
     * Prefer environment base URL:
     * PROD_URL / STAGING_URL / LOCALHOST fallback
     */
    baseURL: process.env.BASE_URL || process.env.STAGING_URL || 'http://localhost:3000',

    // news users often on slow connections
    viewport: { width: 1366, height: 768 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Collect debugging info
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'on',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Mainstream mobile
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 14'] },
    },

    // --- EDGE CASE DEVICES ---

    // Very small screen (old budget iPhone)
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },

    // Low-end Android common in South Asia
    {
      name: 'small-android',
      use: { ...devices['Galaxy S8'] },
    },

    // Large phone in landscape (nav issues show here)
    {
      name: 'pixel-landscape',
      use: {
        ...devices['Pixel 7'],
        isMobile: true,

        viewport: { width: 915, height: 412 },
      },
    },

    // Popular tablet layout breakpoint
    {
      name: 'ipad',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Large tablet (often triggers “desktop-ish” layouts)
    {
      name: 'ipad-pro',
      use: { ...devices['iPad Pro 11'] },
    },

    // Foldable device (weird aspect ratio → layout bugs)
    {
      name: 'galaxy-fold',
      use: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-F926B) AppleWebKit/537.36 Chrome/103.0.0.0 Mobile Safari/537.36',
        viewport: { width: 653, height: 841 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // Only start dev server when running locally
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
