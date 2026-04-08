import { defineConfig, devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';

/**
 * Конфигурация Playwright для e2e системных тестов UI
 * Покрывает критические user journeys: создание, расчет КБЖУ, удаление
 */
const config: PlaywrightTestConfig = {
  testDir: './e2e',
  workers: 1,
  timeout: 30000,
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'cd .. && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [['html']],

  globalSetup: './e2e/global-setup.ts',
};

export default defineConfig(config);
