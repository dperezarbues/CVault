/**
 * Verifies that configured style params are actually applied in the rendered PDF —
 * not just that a new compilation was triggered.
 *
 * Colors       → canvas getImageData() at coordinates derived from text-layer span positions.
 * Font sizes   → before/after comparison of text-layer span inline fontSize style.
 * Font family  → NOT tested here.  Only "New Computer Modern" fonts are bundled in
 *                /public/fonts/, so all font-family options produce identical output.
 *                The recompile trigger is already verified in style-shared-params.spec.ts.
 *
 * The test CV uses cv.starter.json placeholder content so we have predictable
 * text to target: "Your Name" (heading), "Your professional summary." (body),
 * "2020 – Present" (muted / period), "Job Title" (entry title).
 */

import { expect, type Locator, type Page, test } from '@playwright/test'
import {
  COMPILE_TIMEOUT,
  expandGroup,
  openEditor,
  openStyleTab,
  setColor,
  setRange,
  waitForNewPdf,
} from './helpers'

// ── setup ─────────────────────────────────────────────────────────────────────

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
  if (!src) throw new Error('data-pdf-src attribute not found after initial compile')
  expect(src).toMatch(/^blob:/)
  await expect(viewer).toHaveAttribute('data-render-state', 'ready', { timeout: 15_000 })
  return src
}

// ── content helpers ───────────────────────────────────────────────────────────

/**
 * Samples the canvas pixel colour at a point within a text-layer span.
 *
 * The bounding box and getImageData call are batched into a single page.evaluate
 * so scroll position cannot shift the element between the two measurements.
 *
 * The darkest pixel in a 5×5 sample area is returned — this hits the glyph body
 * rather than an anti-aliased edge or inter-character gap.  For anti-aliased text
 * on a light background, the sampled pixel is a blend of the text colour and the
 * background; use channel-dominance assertions rather than hard channel cutoffs.
 */
async function sampleColorAtSpan(
  page: Page,
  span: Locator,
): Promise<{ r: number; g: number; b: number }> {
  await span.scrollIntoViewIfNeeded()

  return span.evaluate((el) => {
    const box = el.getBoundingClientRect()
    // Sample slightly left of center to reduce the chance of landing on a
    // gap between characters.
    const vx = box.left + box.width * 0.3
    const vy = box.top + box.height * 0.45

    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-testid="pdfjs-viewer"] canvas',
    )
    if (!canvas) throw new Error('PDF canvas not found')
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const cx = Math.round((vx - rect.left) * dpr)
    const cy = Math.round((vy - rect.top) * dpr)
    // Clamp both origin and extent so the sample never reads outside canvas bounds.
    const x0 = Math.max(0, Math.min(cx - 2, canvas.width - 5))
    const y0 = Math.max(0, Math.min(cy - 2, canvas.height - 5))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2d context unavailable')
    const { data } = ctx.getImageData(x0, y0, 5, 5)
    // Find the darkest pixel — most likely to be the glyph, not the background.
    let best = { r: 255, g: 255, b: 255, luma: 255 * 3 }
    for (let i = 0; i < data.length; i += 4) {
      const luma = data[i] + data[i + 1] + data[i + 2]
      if (luma < best.luma) best = { r: data[i], g: data[i + 1], b: data[i + 2], luma }
    }
    return { r: best.r, g: best.g, b: best.b }
  })
}

/**
 * Extracts the numeric size from a text-layer span's inline fontSize style.
 * PDF.js sets it as `calc(var(--scale-factor)*Xpx)` where X approximates the
 * original font size in points.
 *
 * Throws (rather than returning 0) when the format is not recognised so that a
 * PDF.js API change surfaces as an explicit test failure rather than a vacuous
 * assertion (largeSize > 0 * ratio is always true for any positive largeSize).
 */
async function getSpanFontSizePx(span: Locator): Promise<number> {
  return span.evaluate((el: HTMLElement) => {
    const match = el.style.fontSize.match(/([\d.]+)px\s*\)/)
    if (!match) throw new Error(`unexpected fontSize format: "${el.style.fontSize}"`)
    return parseFloat(match[1])
  })
}

function textLayerSpan(page: Page, pattern: string | RegExp): Locator {
  return page
    .locator('[data-testid="pdfjs-viewer"] .textLayer span')
    .filter({ hasText: pattern })
    .first()
}

// ── color tests ───────────────────────────────────────────────────────────────

test.describe('PDF content — colours', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('heading colour is applied to the rendered name', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #cc0000 = rgb(204, 0, 0) — vivid red, unambiguously distinguishable from the
    // dark-grey defaults regardless of anti-aliasing.
    await setColor(page, 'heading_color', '#cc0000')
    await waitForNewPdf(page, old)

    const span = textLayerSpan(page, /Your Name/)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    const label = `rgb(${r},${g},${b})`
    // Assert channel dominance rather than hard bounds — anti-aliasing blends the
    // text colour with the background but red is always the dominant channel.
    expect(r, `red dominant for #cc0000: ${label}`).toBeGreaterThan(g + 10)
    expect(r, `red dominant for #cc0000: ${label}`).toBeGreaterThan(b + 10)
  })

  test('body colour is applied to body text', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #0000cc = rgb(0, 0, 204) — vivid blue
    await setColor(page, 'body_color', '#0000cc')
    await waitForNewPdf(page, old)

    // Use the start of the sentence to avoid matching a split span mid-word.
    const span = textLayerSpan(page, /Your professional summary/)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    const label = `rgb(${r},${g},${b})`
    expect(b, `blue dominant for #0000cc: ${label}`).toBeGreaterThan(r + 10)
    expect(b, `blue dominant for #0000cc: ${label}`).toBeGreaterThan(g + 10)
  })

  test('muted colour is applied to period / meta text', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    // #009900 = rgb(0, 153, 0) — vivid green.  Max channel value is 153 (lower than
    // red/blue options) so muted-colour text is thinner and more heavily anti-aliased;
    // use a wider dominance margin (+20) for robustness.
    await setColor(page, 'muted_color', '#009900')
    await waitForNewPdf(page, old)

    // Full period string from the starter experience entry — unique in the document.
    const span = textLayerSpan(page, /2020/)
    await expect(span).toBeVisible()
    const { r, g, b } = await sampleColorAtSpan(page, span)
    const label = `rgb(${r},${g},${b})`
    expect(g, `green dominant for #009900: ${label}`).toBeGreaterThan(r + 20)
    expect(g, `green dominant for #009900: ${label}`).toBeGreaterThan(b + 20)
  })
})

// ── font-size tests ───────────────────────────────────────────────────────────

test.describe('PDF content — font sizes', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('name size change is reflected in the rendered name span', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    // Measure at the DEFAULT size (17 pt).
    const span = textLayerSpan(page, /Your Name/)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change to maximum (24 pt) — a ~41 % increase.
    await openStyleTab(page)
    await expandGroup(page, 'Typography')
    await setRange(page, 'name_size', 24)
    await waitForNewPdf(page, old)

    const newSpan = textLayerSpan(page, /Your Name/)
    await expect(newSpan).toBeVisible()
    const largeSize = await getSpanFontSizePx(newSpan)
    expect(largeSize).toBeGreaterThan(defaultSize * 1.25)
  })

  test('body text size change is reflected in summary text span', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    const span = textLayerSpan(page, /Your professional summary/)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change from default 8.5 pt to maximum 11 pt — a ~29 % increase.
    await openStyleTab(page)
    await expandGroup(page, 'Typography')
    await setRange(page, 'body_size', 11)
    await waitForNewPdf(page, old)

    const newSpan = textLayerSpan(page, /Your professional summary/)
    await expect(newSpan).toBeVisible()
    const largeSize = await getSpanFontSizePx(newSpan)
    expect(largeSize).toBeGreaterThan(defaultSize * 1.20)
  })

  test('entry title size change is reflected in the job title span', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    // "Job Title" from the starter experience entry.
    const span = textLayerSpan(page, /Job Title/)
    await expect(span).toBeVisible()
    const defaultSize = await getSpanFontSizePx(span)

    // Change from default 9.5 pt to maximum 12 pt — a ~26 % increase.
    await openStyleTab(page)
    await expandGroup(page, 'Typography')
    await setRange(page, 'entry_size', 12)
    await waitForNewPdf(page, old)

    const newSpan = textLayerSpan(page, /Job Title/)
    await expect(newSpan).toBeVisible()
    const largeSize = await getSpanFontSizePx(newSpan)
    expect(largeSize).toBeGreaterThan(defaultSize * 1.20)
  })
})
