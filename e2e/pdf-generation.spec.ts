import { expect, test } from '@playwright/test'

// WASM compilation can take up to 30 s on first load
const GENERATE_TIMEOUT = 60_000

test.describe('PDF generation (WASM)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => {
      localStorage.setItem('cvault-onboarded', '1')
    })
    await page.reload()
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })

    // Create a CV so Generate PDF is available
    await page.getByTitle('New CV').click()
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('WASM Test CV')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('button', { name: 'WASM Test CV' })).toBeVisible()
  })

  test('Generate PDF produces a preview blob URL', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 10_000)
    const iframe = page.locator('iframe')
    const initialSrc = await iframe.getAttribute('src')
    expect(initialSrc).toMatch(/\.pdf$/) // starts as sample

    // Click Generate PDF in the layout editor panel
    await page.getByRole('button', { name: 'Generate PDF' }).first().click()

    // Wait for generating overlay to disappear
    await expect(page.getByText('Generating PDF…')).not.toBeVisible({
      timeout: GENERATE_TIMEOUT,
    })

    // iframe src should now be a blob URL
    const newSrc = await iframe.getAttribute('src')
    expect(newSrc).toMatch(/^blob:/)

    // "preview" badge should appear
    await expect(page.getByText('preview', { exact: true })).toBeVisible()

    // Download button should appear
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible()
  })

  test('Reset clears generated preview back to sample', async ({ page }) => {
    test.setTimeout(GENERATE_TIMEOUT + 10_000)
    // Generate first
    await page.getByRole('button', { name: 'Generate PDF' }).first().click()
    await expect(page.getByText('Generating PDF…')).not.toBeVisible({
      timeout: GENERATE_TIMEOUT,
    })
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible()

    // Reset
    await page.getByRole('button', { name: 'Reset' }).click()
    const src = await page.locator('iframe').getAttribute('src')
    expect(src).toMatch(/\.pdf$/) // back to sample
    await expect(page.getByText('preview', { exact: true })).not.toBeVisible()
  })
})
