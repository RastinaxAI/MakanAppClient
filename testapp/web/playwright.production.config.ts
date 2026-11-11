import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/production',
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://127.0.0.1:3159',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chromium',
    headless: true,
    timezoneId: 'Asia/Tehran',
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/test-server.mjs --ordinary-runtime',
    url: 'http://127.0.0.1:3159/enter',
    reuseExistingServer: false,
    timeout: 60000,
  },
  reporter: [['list'], ['json', { outputFile: 'test-results/production-results.json' }]],
  outputDir: 'test-results/production',
});
