import { defineConfig } from "@playwright/test"

const port = 3100
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      CI: "true",
      E2E_DISABLE_TELEGRAM_DELIVERY: "true",
      E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT: "true",
      CONTACT_RATE_LIMIT_GLOBAL_MAX_ATTEMPTS: "1000",
      NEXT_PUBLIC_SITE_URL: baseURL,
      MDX_CONTENT_SOURCE: "local",
      TELEGRAM_BOT_TOKEN: "",
      GROUP_CHAT_ID: "",
      TELEGRAM_REQUEST_TIMEOUT_MS: "8000",
    },
  },
})
