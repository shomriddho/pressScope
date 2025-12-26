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

    // Mobile (majority of BD readers!)
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 14'] },
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
