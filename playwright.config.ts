import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    headless: false,
    video: 'on',
    screenshot: 'on',
    trace: 'on',
    launchOptions: { slowMo: 500 },
  },
  projects: [{ name: 'chromium' }],
});