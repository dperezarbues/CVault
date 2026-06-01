/**
 * Verifies that configured style params are actually applied in the rendered PDF —
 * not just that a new compilation was triggered.
 *
 * Colors       → canvas getImageData() at coordinates derived from text-layer span positions.
 * Font sizes   → before/after comparison of text-layer span bounding-box heights.
 * Font family  → NOT tested here.  Only "New Computer Modern" fonts are bundled in
 *                /public/fonts/, so all font-family options produce identical output.
 *                The recompile trigger is already verified in style-shared-params.spec.ts.
 *
 * The test CV uses cv.starter.json placeholder content so we have predictable
 * text to target: "Your Name" (heading), "Your professional summary." (body),
 * "2020 – Present" (muted / period).
 */

import { expect, type Locator, type Page, test } from '@playwright/test'

const COMPILE_TIMEOUT = 60_000

// ── setup helpers ─────────────────────────────────────────────────────────────

async function openEditor(page: Page) {
  await page.goto('/en/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
}

/** Create a CV (uses cv.starter.json content), generate a PDF, wait for render. */
async function setupWithPdf(page: Page): Promise<string> {
  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Content Test CV')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Content Test CV' })).toBeVisible()
  await page.getByRole('tab', { name: /Layout/i }).click()
  await page.getByRole('button', { name: 'Generate PDF' }).first().click()
  await expect(page.getByText('Generating PDF…')).not.toBeVisible({ timeout: COMPILE_TIMEOUT })
  const viewer = page.locator('[data-testid="pdfjs-viewer"]')
  const src = await viewer.getAttribute('data-pdf-src')
  expect(src).toMatch(/^blob:/)
  await expect(viewer).toHaveAttribute('data-render-state', 'ready', { timeout: 15_000 })
  return src as string
}

async function waitForNewPdf(page: Page, oldSrc: string) {
  const viewer = page.locator('[data-testid="pdfjs-viewer"]')
  await expect(async () => {
    const src = await viewer.getAttribute('data-pdf-src')
    expect(src).toMatch(/^blob:/)
    expect(src).not.toEqual(oldSrc)
  }).toPass({ timeout: COMPILE_TIMEOUT, intervals: [500] })
  await expect(viewer).toHaveAttribute('data-render-state', 'ready', { timeout: 15_000 })
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

async function openStyleTab(page: Page) {
  await page.getByRole('tab', { name: /Style/i }).click()
}

async function expandGroup(page: Page, title: string) {
  const btn = page.locator('button').filter({ hasText: title }).filter({ hasText: '▼' })
  if ((await btn.count()) > 0) await btn.first().click()
}

// ── content helpers ───────────────────────────────────────────────────────────

/**
 * Samples the canvas pixel at the center of a text-layer span.
 * Picks the darkest pixel in a 5×5 sample area so we reliably hit the glyph
 * body rather than a gap or anti-aliased edge.  Works for any text color
 * darker than the page background.
 *
 * Returns the raw RGBA values of the darkest pixel.  For anti-aliased text on
 * a light background, the sampled pixel is a blend of the text colour and the
 * background — use channel-dominance assertions rather than hard cutoffs.
 */
async function sampleColorAtSpan(
  page: Page,
  span: Locator,
): Promise<{ r: number; g: number; b: number }> {
  await span.scrollIntoViewIfNeeded()
  const box = await span.boundingBox()
  if (!box) throw new Error('span bounding box not found')

  return page.evaluate(
    ({ vx, vy }) => {
      const canvas = document.querySelector(
        '[data-testid="pdfjs-viewer"] canvas',
      ) as HTMLCanvasElement | null
      if (!canvas) throw new Error('PDF canvas not found')
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cx = Math.round((vx - rect.left) * dpr)
      const cy = Math.round((vy - rect.top) * dpr)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2d context unavailable')
      const { data } = ctx.getImageData(Math.max(0, cx - 2), Math.max(0, cy - 2), 5, 5)
      // Darkest pixel in the area is most likely to be the glyph, not background.
      let best = { r: 255, g: 255, b: 255, luma: 255 * 3 }
      for (let i = 0; i < data.length; i += 4) {
        const luma = data[i] + data[i + 1] + data[i + 2]
        if (luma < best.luma) best = { r: data[i], g: data[i + 1], b: data[i + 2], luma }
      }
      return { r: best.r, g: best.g, b: best.b }
    },
    // Sample slightly left of center to avoid hitting a gap between characters.
    { vx: box.x + box.width * 0.3, vy: box.y + box.height * 0.45 },
  )
}

/**
 * Extracts the numeric pt value from a text-layer span's inline fontSize style.
 * PDF.js sets it as `calc(var(--scale-factor)*Xpx)` where X approximates the
 * original font size in points.
 */
async function getSpanFontSizePx(span: Locator): Promise<number> {
  const handle = await span.elementHandle()
  if (!handle) throw new Error('span element handle not found')
  return handle.evaluate((el) => {
    const match = (el as HTMLElement).style.fontSize.match(/([\d.]+)px\s*\)/)
    return match ? parseFloat(match[1]) : 0
  })
}


function textLayerSpan(page: Page, pattern: string | RegExp): Locator {
  return page
    .locator('[data-testid="pdfjs-viewer"] .textLayer span')
    .filter({ hasText: pattern })
    .first()
}

// ── color tests ───────────────────────────────────────────────────────────────

test.describe('PDF content — colors', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('heading_color is applied to the rendered name', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #cc0000 = rgb(204, 0, 0) — bright red, clearly distinguishable from defaults
    await setColor(page, 'heading_color', '#cc0000')
    await waitForNewPdf(page, old)

    const span = textLayerSpan(page, /Your Name/)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    const label = `rgb(${r},${g},${b})`
    expect(r, `red dominant for #cc0000: ${label}`).toBeGreaterThan(g + 10)
    expect(r, `red dominant for #cc0000: ${label}`).toBeGreaterThan(b + 10)
  })

  test('body_color is applied to body text', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #0000cc = rgb(0, 0, 204) — bright blue
    await setColor(page, 'body_color', '#0000cc')
    await waitForNewPdf(page, old)

    // "Your professional summary." is the most reliable body text target
    const span = textLayerSpan(page, /summary/i)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    const label = `rgb(${r},${g},${b})`
    expect(b, `blue dominant for #0000cc: ${label}`).toBeGreaterThan(r + 10)
    expect(b, `blue dominant for #0000cc: ${label}`).toBeGreaterThan(g + 10)
  })

  test('muted_color is applied to period / meta text', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #009900 = rgb(0, 153, 0) — bright green
    await setColor(page, 'muted_color', '#009900')
    await waitForNewPdf(page, old)

    // "2020" from the experience period "2020 – Present"
    const span = textLayerSpan(page, /2020/)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    // Anti-aliasing blends text colour with the background, so we assert channel
    // DOMINANCE (green meaningfully larger than red and blue) rather than hard bounds.
    const label = `rgb(${r},${g},${b})`
    expect(g, `green dominant for #009900: ${label}`).toBeGreaterThan(r + 10)
    expect(g, `green dominant for #009900: ${label}`).toBeGreaterThan(b + 10)
  })
})

// ── font-size tests ───────────────────────────────────────────────────────────

test.describe('PDF content — font sizes', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('name_size change is reflected in the rendered name span height', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    // Measure span height at the DEFAULT size (17 pt)
    const span = textLayerSpan(page, /Your Name/)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change to maximum (24 pt) — a ~41 % increase
    await openStyleTab(page)
    await setRange(page, 'name_size', 24)
    await waitForNewPdf(page, old)

    const largeSize = await getSpanFontSizePx(textLayerSpan(page, /Your Name/))
    expect(largeSize).toBeGreaterThan(defaultSize * 1.25)
  })

  test('body_size change is reflected in body text span height', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    const span = textLayerSpan(page, /summary/i)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change from default 8.5 pt to maximum 11 pt — a ~29 % increase
    await openStyleTab(page)
    await setRange(page, 'body_size', 11)
    await waitForNewPdf(page, old)

    const largeSize = await getSpanFontSizePx(textLayerSpan(page, /summary/i))
    expect(largeSize).toBeGreaterThan(defaultSize * 1.15)
  })

  test('entry_size change is reflected in entry title span height', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    // "Job Title" from the starter experience entry
    const span = textLayerSpan(page, /Job Title/)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change from default 9.5 pt to maximum 12 pt — a ~26 % increase
    await openStyleTab(page)
    await setRange(page, 'entry_size', 12)
    await waitForNewPdf(page, old)

    const largeSize = await getSpanFontSizePx(textLayerSpan(page, /Job Title/))
    expect(largeSize).toBeGreaterThan(defaultSize * 1.15)
  })
})

