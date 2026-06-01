/**
 * Shared Playwright helpers for the CVault e2e suite.
 *
 * Extracted from the individual spec files to eliminate copy-paste duplication
 * across style-shared-params, style-template-params, layout-options, and
 * pdf-content specs.
 */

import { expect, type Page } from '@playwright/test'

export const COMPILE_TIMEOUT = 60_000

export async function openEditor(page: Page) {
  await page.goto('/en/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
}

/**
 * Waits for a new PDF blob to appear AND for the viewer to finish rendering it.
 *
 * Both conditions are checked inside the same `toPass` retry predicate so there
 * is no race window between "blob changed" and "render-state ready" that a rapid
 * second recompile could exploit.
 *
 * The inner render-state check uses a short 100 ms timeout so it fails fast on
 * attempts where the canvas is still painting, letting the outer loop retry
 * quickly rather than blocking for the full default timeout.
 */
export async function waitForNewPdf(page: Page, oldSrc: string) {
  const viewer = page.locator('[data-testid="pdfjs-viewer"]')
  await expect(async () => {
    const src = await viewer.getAttribute('data-pdf-src')
    expect(src).toMatch(/^blob:/)
    expect(src).not.toEqual(oldSrc)
    await expect(viewer).toHaveAttribute('data-render-state', 'ready', { timeout: 100 })
  }).toPass({ timeout: COMPILE_TIMEOUT + 20_000, intervals: [500] })
}

export async function setRange(page: Page, id: string, value: number) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, String(v))
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

export async function setColor(page: Page, id: string, hex: string) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, hex)
}

export async function expandGroup(page: Page, title: string) {
  const btn = page.locator('button').filter({ hasText: title }).filter({ hasText: '▼' })
  if ((await btn.count()) > 0) await btn.first().click()
}

export async function openStyleTab(page: Page) {
  await page.getByRole('tab', { name: /Style/i }).click()
}

/** Opens the Style tab and expands the named accordion group if it is collapsed. */
export async function openStyleGroup(page: Page, group: string) {
  await openStyleTab(page)
  await expandGroup(page, group)
}
