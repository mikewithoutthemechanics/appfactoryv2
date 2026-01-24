// Playwright E2E skeleton (not executed in this scaffold)
import { test, expect } from '@playwright/test'

test('basic signup flow placeholder', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page).toHaveTitle(/AppFactory Final/i)
})
