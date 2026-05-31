import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// color-contrast is a known design trade-off (text-gray-400 on white is intentionally light).
// These tests target structural/ARIA violations — especially custom controls like DnD handles,
// accordion toggles, and tab widgets — which are regression-prone and not caught by TypeScript.
const DISABLED_RULES = ['color-contrast']

test.describe('Accessibility — axe-core regression', () => {
  test('landing page has no structural violations', async ({ page }) => {
    await page.goto('/en/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('editor page (onboarded) has no structural violations', async ({ page }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      // The iframe PDF viewer is a browser-native control — exclude it from axe scan
      .exclude('iframe')
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('CV data modal (Editor tab) has no structural violations', async ({ page }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
    await page.getByTitle('New CV').click()
    await expect(page.getByRole('heading', { name: 'New CV' })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      .exclude('iframe')
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('CV data modal (JSON tab) has no structural violations', async ({ page }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
    await page.getByTitle('New CV').click()
    await page.getByRole('button', { name: 'JSON', exact: true }).click()
    await expect(page.locator('textarea[spellcheck="false"]')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      .exclude('iframe')
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('layout editor panel (DnD drag handles, section toggles) has no structural violations', async ({
    page,
  }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()

    // Open the layout editor panel where DnD drag handles live
    const layoutTab = page.getByRole('button', { name: /Layout/i })
    if (await layoutTab.isVisible()) {
      await layoutTab.click()
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      .exclude('iframe')
      .analyze()
    expect(results.violations).toEqual([])
  })
})
