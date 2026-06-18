import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  // Form submits to Power Automate; the success banner can take >5s
  // to render after the POST. Bump expect's auto-wait window so
  // toBeVisible() against the banner doesn't flake.
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],

  use: {
    baseURL:
      process.env.ALUMNI_FORM_URL ??
      'https://umanitoba.ca/community/alumni/alumni-update-your-contact-information',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
