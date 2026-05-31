/**
 * Verifies the mobile PDF generation flow end-to-end:
 * create a CV → tap the tab-bar "Gen PDF" button → blob URL appears in iframe.
 *
 * This covers the specific regression path that was missing: the existing
 * responsive tests only checked layout with the sample PDF (no CV created,
 * no generation triggered).
 */

import { expect, type Page, test } from '@playwright/test'

const MOBILE = { width: 375, height: 667 }
const GENERATE_TIMEOUT = 60_000

async function gotoEditorMobile(page: Page) {
  await page.setViewportSize(MOBILE)
  await page.goto('/en/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
}

async function createCvOnMobile(page: Page, name: string) {
  // Open Data panel via mobile tab bar
  await page.getByTestId('mobile-tab-data').click()
  await expect(page.locator('.editor-aside')).toHaveAttribute('data-open', 'true')

  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(name)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: name })).toBeVisible()

  // Close the panel so the PDF preview is accessible
  await page.getByRole('button', { name: 'Close panel' }).click()
  await expect(page.locator('.editor-aside')).toHaveAttribute('data-open', 'false')
}

// ── Gen PDF via tab bar ───────────────────────────────────────────────────────

test.describe('Mobile PDF generation — tab bar button', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditorMobile(page)
  })

  test('Gen PDF tab-bar button generates a PDF and shows blob URL', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 20_000)

    await createCvOnMobile(page, 'Mobile Gen CV')

    const initialSrc = await page.locator('iframe').getAttribute('src')
    expect(initialSrc).toMatch(/\.pdf$/) // starts as sample

    // Tap the mobile tab-bar Gen PDF button
    const genBtn = page.getByTestId('mobile-tabbar').getByRole('button', { name: /Gen PDF/i })
    await expect(genBtn).toBeEnabled()
    await genBtn.click()

    // Wait for blob URL
    await expect(async () => {
      const src = await page.locator('iframe').getAttribute('src')
      expect(src).toMatch(/^blob:/)
    }).toPass({ timeout: GENERATE_TIMEOUT, intervals: [500] })
  })

  test('Download button appears in preview after mobile PDF generation', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 20_000)

    await createCvOnMobile(page, 'Mobile Download CV')

    await page.getByTestId('mobile-tabbar').getByRole('button', { name: /Gen PDF/i }).click()

    await expect(async () => {
      const src = await page.locator('iframe').getAttribute('src')
      expect(src).toMatch(/^blob:/)
    }).toPass({ timeout: GENERATE_TIMEOUT, intervals: [500] })

    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible()
  })

  test('PDF iframe remains visible and fills screen after mobile generation', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 20_000)

    await createCvOnMobile(page, 'Mobile Layout CV')

    await page.getByTestId('mobile-tabbar').getByRole('button', { name: /Gen PDF/i }).click()

    await expect(async () => {
      const src = await page.locator('iframe').getAttribute('src')
      expect(src).toMatch(/^blob:/)
    }).toPass({ timeout: GENERATE_TIMEOUT, intervals: [500] })

    const iframeBox = await page.locator('iframe').boundingBox()
    const tabbarBox = await page.getByTestId('mobile-tabbar').boundingBox()

    expect(iframeBox).not.toBeNull()
    expect(tabbarBox).not.toBeNull()
    // iframe should still sit above the tab bar
    expect(iframeBox!.y + iframeBox!.height).toBeLessThanOrEqual(tabbarBox!.y + 2)
    // and still occupy most of the screen
    expect(iframeBox!.height).toBeGreaterThan(MOBILE.height * 0.6)
  })

  test('Reset returns to sample PDF on mobile', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 20_000)

    await createCvOnMobile(page, 'Mobile Reset CV')

    await page.getByTestId('mobile-tabbar').getByRole('button', { name: /Gen PDF/i }).click()

    await expect(async () => {
      const src = await page.locator('iframe').getAttribute('src')
      expect(src).toMatch(/^blob:/)
    }).toPass({ timeout: GENERATE_TIMEOUT, intervals: [500] })

    await page.getByRole('button', { name: 'Reset' }).click()

    const src = await page.locator('iframe').getAttribute('src')
    expect(src).toMatch(/\.pdf$/) // back to sample
    await expect(page.getByRole('button', { name: 'Download' })).not.toBeVisible()
  })

  test('Gen PDF button is disabled before a CV is created', async ({ page }) => {
    const genBtn = page.getByTestId('mobile-tabbar').getByRole('button', { name: /Gen PDF/i })
    await expect(genBtn).toBeDisabled()
  })
})
