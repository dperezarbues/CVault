/**
 * Verifies that template-specific style params trigger PDF recompiles.
 * Covers both pre-existing params and the ones newly added (headline_size,
 * section_pre/post for compact/banner/timeline/tech/editorial; accent_color
 * for academic).
 *
 * Each test: selects the template → generates a base PDF → changes one param
 * → asserts a new blob URL appears in the iframe.
 */

import { expect, type Page, test } from '@playwright/test'

const COMPILE_TIMEOUT = 60_000

async function openEditor(page: Page) {
  await page.goto('/en/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
}

async function createCv(page: Page) {
  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Template Param CV')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Template Param CV' })).toBeVisible()
}

async function selectTemplate(page: Page, id: string) {
  await page.getByRole('tab', { name: /Template/i }).click()
  await page.getByTestId(`template-btn-${id}`).click()
}

async function generatePdf(page: Page): Promise<string> {
  await page.getByRole('tab', { name: /Layout/i }).click()
  await page.getByRole('button', { name: 'Generate PDF' }).first().click()
  await expect(page.getByText('Generating PDF…')).not.toBeVisible({ timeout: COMPILE_TIMEOUT })
  const src = await page.locator('[data-testid="pdfjs-viewer"]').getAttribute('data-pdf-src')
  expect(src).toMatch(/^blob:/)
  return src as string
}

async function waitForNewPdf(page: Page, oldSrc: string) {
  await expect(async () => {
    const src = await page.locator('[data-testid="pdfjs-viewer"]').getAttribute('data-pdf-src')
    expect(src).toMatch(/^blob:/)
    expect(src).not.toEqual(oldSrc)
  }).toPass({ timeout: COMPILE_TIMEOUT, intervals: [500] })
}

async function setRange(page: Page, id: string, value: number) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, String(v))
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

async function setColor(page: Page, id: string, hex: string) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, hex)
}

async function expandGroup(page: Page, title: string) {
  const btn = page.locator('button').filter({ hasText: title }).filter({ hasText: '▼' })
  if ((await btn.count()) > 0) await btn.first().click()
}

async function openStyleGroup(page: Page, group: string) {
  await page.getByRole('tab', { name: /Style/i }).click()
  await expandGroup(page, group)
}

// ── Default template ───────────────────────────────────────────────────────────

test.describe('Default template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
  })

  test('accent colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })

  test('section_post triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_post', 0.35)
    await waitForNewPdf(page, old)
  })
})

// ── Modern template ───────────────────────────────────────────────────────────

test.describe('Modern template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'modern')
  })

  test('header background colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Header')
    await setColor(page, 'header_bg', '#001133')
    await waitForNewPdf(page, old)
  })

  test('accent / links colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Header')
    await setColor(page, 'accent', '#ff9900')
    await waitForNewPdf(page, old)
  })
})

// ── Sidebar template ──────────────────────────────────────────────────────────

test.describe('Sidebar template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'sidebar')
  })

  test('sidebar background colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Sidebar')
    await setColor(page, 'sidebar_bg', '#001133')
    await waitForNewPdf(page, old)
  })

  test('sidebar width triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Sidebar')
    await setRange(page, 'sidebar_width', 8)
    await waitForNewPdf(page, old)
  })
})

// ── Compact template (newly added: headline_size, section_pre/post) ────────────

test.describe('Compact template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'compact')
  })

  test('accent colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })
})

// ── Banner template (newly added: headline_size, section_pre/post) ─────────────

test.describe('Banner template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'banner')
  })

  test('header background colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Header')
    await setColor(page, 'header_bg', '#001133')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })
})

// ── Timeline template (newly added: headline_size, section_pre/post) ───────────

test.describe('Timeline template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'timeline')
  })

  test('accent colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })
})

// ── Academic template (newly added: accent_color, headline_size, section_pre/post)

test.describe('Academic template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'academic')
  })

  test('accent / links colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })
})

// ── Tech template (newly added: headline_size, section_pre/post) ───────────────

test.describe('Tech template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'tech')
  })

  test('accent colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('headline size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Typography')
    await setRange(page, 'headline_size', 13)
    await waitForNewPdf(page, old)
  })
})

// ── Editorial template (newly added: section_pre/post) ────────────────────────

test.describe('Editorial template — template-specific params', () => {
  test.beforeEach(async ({ page }) => {
    await openEditor(page)
    await createCv(page)
    await selectTemplate(page, 'editorial')
  })

  test('accent colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Colors')
    await setColor(page, 'accent_color', '#cc2200')
    await waitForNewPdf(page, old)
  })

  test('section_pre triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await generatePdf(page)
    await openStyleGroup(page, 'Spacing')
    await setRange(page, 'section_pre', 0.8)
    await waitForNewPdf(page, old)
  })
})
