import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  reporter: [["html"], ["list"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  // ge.globo.com carrega muitos anuncios/trackers de terceiros; 45s da folga
  // segura acima do domcontentloaded sem mascarar uma falha real.
  timeout: 45000,
  use: {
    actionTimeout: 15000,
    baseURL: process.env.GE_BASE_URL ?? "https://ge.globo.com",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

