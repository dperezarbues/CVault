import { expect, test } from '@playwright/test'

const EDITOR_URL = '/editor'

test.describe('Editor — initial load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('shows welcome modal on first visit', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to CVault' })).toBeVisible()
    await expect(page.getByText('A privacy-first CV editor')).toBeVisible()
  })

  test('dismisses welcome modal and shows editor', async ({ page }) => {
    await page.getByRole('button', { name: 'Get started' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome to CVault' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'CV Templates' })).toBeVisible()
  })

  test('shows sample PDF banner when no CV exists', async ({ page }) => {
    await page.getByRole('button', { name: 'Get started' }).click()
    await expect(page.getByText('Add your CV to generate your own PDF')).toBeVisible()
    await expect(page.getByRole('button', { name: '+ New CV' })).toBeVisible()
  })

  test('private mode checkbox is present in welcome modal', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /shared computer/i })
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()
  })

  test('? button reopens welcome modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Get started' }).click()
    await page.getByTitle('Help').click()
    await expect(page.getByRole('heading', { name: 'Welcome to CVault' })).toBeVisible()
  })
})

test.describe('Editor — template and layout selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL)
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
  })

  test('shows template list in sidebar', async ({ page }) => {
    await expect(page.locator('aside').getByRole('button').first()).toBeVisible()
  })

  test('PDF preview iframe is rendered with sample PDF', async ({ page }) => {
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()
    const src = await iframe.getAttribute('src')
    expect(src).toMatch(/\.pdf/)
  })

  test('layout editor panel is visible', async ({ page }) => {
    await expect(page.getByText('Layout editor')).toBeVisible()
  })
})

test.describe('Editor — CV management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL)
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
  })

  test('opens New CV modal', async ({ page }) => {
    await page.getByTitle('New CV').click()
    await expect(page.getByRole('heading', { name: 'New CV' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
  })

  test('can fill in CV name and cancel', async ({ page }) => {
    await page.getByTitle('New CV').click()
    await page.getByRole('textbox', { name: 'Name' }).fill('My Test CV')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'New CV' })).not.toBeVisible()
  })

  test('saves a new CV and shows it in the list', async ({ page }) => {
    await page.getByTitle('New CV').click()
    await page.getByRole('textbox', { name: 'Name' }).fill('E2E Test CV')
    // Use exact match to avoid matching 'Saved' accordion and 'Save as…' button
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'New CV' })).not.toBeVisible()
    // CV name appears in sidebar list
    await expect(page.getByText('E2E Test CV')).toBeVisible()
    // "Add your CV" banner is gone — a CV now exists
    await expect(page.getByText('Add your CV to generate your own PDF')).not.toBeVisible()
  })

  test('closes New CV modal with × button', async ({ page }) => {
    await page.getByTitle('New CV').click()
    await expect(page.getByRole('heading', { name: 'New CV' })).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('heading', { name: 'New CV' })).not.toBeVisible()
  })
})

test.describe('Editor — layout editor panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL)
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
    // Wait for LayoutEditor dynamic import to finish loading
    await expect(page.getByRole('button', { name: 'Generate PDF' })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('Layout accordion button is visible', async ({ page }) => {
    // AccordionSection renders "Layout ▲" or "Layout ▼"
    await expect(page.getByRole('button', { name: /Layout/i }).first()).toBeVisible()
  })

  test('Style accordion toggle opens style params', async ({ page }) => {
    const styleBtn = page.getByRole('button', { name: /^Style/i })
    await expect(styleBtn).toBeVisible()
    await styleBtn.click()
    await expect(page.getByRole('button', { name: /Reset to defaults/i })).toBeVisible()
  })

  test('Generate PDF button is present and enabled', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: 'Generate PDF' })
    await expect(generateBtn).toBeVisible()
    await expect(generateBtn).toBeEnabled()
  })
})
