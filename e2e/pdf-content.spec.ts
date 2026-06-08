/**
 * Verifies that configured style params are actually applied in the rendered PDF —
 * not just that a new compilation was triggered.
 *
 * Colors       → pdfjs getOperatorList() scans fill-colour operators in the compiled PDF blob.
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
 * Scans every fill-colour operator in the compiled PDF and returns the one
 * where `channel` most dominates the other two.  This avoids canvas pixel
 * sampling entirely — we read the colour values directly from the PDF
 * operator stream via pdfjs `page.getOperatorList()`.
 *
 * pdfjs OPS.setFillRGBColor args are [r, g, b] floats in the 0–1 range.
 * We convert to 0–255 integers before returning so callers can use the same
 * `> n` assertions as before.
 */
async function pdfDominantFillColor(
  page: Page,
  channel: 'r' | 'g' | 'b',
): Promise<{ r: number; g: number; b: number }> {
  const src = await page
    .locator('[data-testid="pdfjs-viewer"]')
    .getAttribute('data-pdf-src')
  if (!src) throw new Error('data-pdf-src not found on viewer')

  return page.evaluate(
    async ({ blobUrl, ch }) => {
      // Re-apply the same Map polyfill that PdfJsViewer.tsx uses so pdfjs
      // loads without throwing in this evaluate context.
      // biome-ignore lint/suspicious/noExplicitAny: polyfill
      const proto = Map.prototype as any
      if (typeof proto.getOrInsertComputed !== 'function') {
        proto.getOrInsertComputed = function <K, V>(key: K, cb: (k: K) => V): V {
          if (!this.has(key)) this.set(key, cb(key))
          return this.get(key)
        }
      }

      const resp = await fetch(blobUrl)
      const data = await resp.arrayBuffer()

      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      const pdf = await pdfjs.getDocument({ data }).promise

      const SET_FILL_RGB = pdfjs.OPS.setFillRGBColor

      let best = { r: 255, g: 255, b: 255, dom: -999 }

      for (let p = 1; p <= pdf.numPages; p++) {
        const pg = await pdf.getPage(p)
        const ops = await pg.getOperatorList()
        for (let i = 0; i < ops.fnArray.length; i++) {
          if (ops.fnArray[i] !== SET_FILL_RGB) continue
          const [rf, gf, bf] = ops.argsArray[i] as [number, number, number]
          const r = Math.round(rf * 255)
          const g = Math.round(gf * 255)
          const b = Math.round(bf * 255)
          const dom =
            ch === 'r' ? r - Math.max(g, b) : ch === 'g' ? g - Math.max(r, b) : b - Math.max(r, g)
          if (dom > best.dom) best = { r, g, b, dom }
        }
      }

      return { r: best.r, g: best.g, b: best.b }
    },
    { blobUrl: src, ch: channel },
  )
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
    // pdfjs v6 sets --font-height inline (PDF pt value labelled as px); v4 set fontSize directly
    const val = el.style.getPropertyValue('--font-height') || el.style.fontSize
    const match = val.match(/([\d.]+)/)
    if (!match) throw new Error(`unexpected fontSize: fontSize="${el.style.fontSize}" --font-height="${val}"`)
    return parseFloat(match[1])
  })
}

function textLayerSpan(page: Page, pattern: string | RegExp): Locator {
  return page
    .locator('[data-testid="pdfjs-viewer"] .textLayer span')
    .filter({ hasText: pattern })
    .first()
}

/**
 * Counts how many text-layer spans have a font size within ±tol of targetPt.
 *
 * Useful for verifying font-size params whose text content may be split into
 * individual character spans (e.g. section headings rendered with heavy
 * letter-tracking) so the full word cannot be matched by a text filter.
 */
async function countSpansAtSize(page: Page, targetPt: number, tol = 0.3): Promise<number> {
  return page.evaluate(
    ({ target, tolerance }) =>
      Array.from(document.querySelectorAll('[data-testid="pdfjs-viewer"] .textLayer span'))
        .filter((el) => {
          const htmlEl = el as HTMLElement
          // pdfjs v6: --font-height stores the PDF pt value; v4: fontSize inline style
          const val = htmlEl.style.getPropertyValue('--font-height') || htmlEl.style.fontSize
          const match = val.match(/([\d.]+)/)
          return match ? Math.abs(parseFloat(match[1]) - target) <= tolerance : false
        }).length,
    { target: targetPt, tolerance: tol },
  )
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

    const { r, g, b } = await pdfDominantFillColor(page, 'r')
    const label = `rgb(${r},${g},${b})`
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

    const { r, g, b } = await pdfDominantFillColor(page, 'b')
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

    const { r, g, b } = await pdfDominantFillColor(page, 'g')
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

  test('section label size change is reflected in the section heading spans', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2 + 20_000)
    const old = await setupWithPdf(page)

    // Section headings use fs-xs = section_heading_size = 7.5 pt (default).
    // This size is unique in the layout:
    //   fs-2xl 17 pt | fs-xl ~10 pt | fs-lg 9.5 pt | fs-md 8.5 pt | fs-sm 8.0 pt |
    //   fs-xs 7.5 pt ← section headings | fs-2xs 6.5 pt
    // Typst applies heavy letter-tracking to section headings, which typically
    // splits the text across individual character spans in PDF.js.  We count
    // spans by font size rather than by text content to avoid that brittle match.
    const beforeCount = await countSpansAtSize(page, 7.5)
    expect(beforeCount, 'section heading spans should exist at default 7.5 pt').toBeGreaterThan(0)

    // Change to maximum 10 pt — a ~33 % increase.
    await openStyleTab(page)
    await expandGroup(page, 'Typography')
    await setRange(page, 'section_heading_size', 10)
    await waitForNewPdf(page, old)

    // The 7.5 pt spans should have moved to 10 pt.
    const afterAt10 = await countSpansAtSize(page, 10)
    expect(afterAt10, 'section heading spans should exist at new 10 pt').toBeGreaterThan(0)
    const afterAt7_5 = await countSpansAtSize(page, 7.5)
    expect(afterAt7_5, 'no spans should remain at old 7.5 pt').toBe(0)
  })
})
