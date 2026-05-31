import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const EDITOR_URL = '/en/editor'

test.describe('Layout import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EDITOR_URL)
    await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
    await page.reload()
    // Suppress Next.js dev overlay so it doesn't intercept pointer events
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
    // Switch to Layout tab so the layout panel (and its Import button) is rendered
    await page.getByRole('tab', { name: /Layout/i }).click()
    await expect(page.getByRole('button', { name: 'Generate PDF' }).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('importing a layout JSON replaces the section list', async ({ page }) => {
    // The default layout has: Summary, Experience, Awards, Skills, 2-col group, Side Projects.
    // Import a layout that has ONLY certifications and languages (not present by default as full sections).
    const layout = {
      header: { style: 'stacked' as const },
      sections: [
        { id: 'certifications', breakable: false },
        { id: 'languages', breakable: false },
      ],
    }
    const tmp = path.join(os.tmpdir(), `layout-${Date.now()}.json`)
    fs.writeFileSync(tmp, JSON.stringify(layout))

    // Trigger the hidden file input via filechooser event
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /↑ Import/i }).click(),
    ])
    await fileChooser.setFiles(tmp)
    fs.unlinkSync(tmp)

    // Scope assertions to section card spans
    const sectionSpans = page.locator(
      '.border.border-gray-200.rounded-lg span.flex-1.text-sm.text-gray-800',
    )

    // Wait for Summary to disappear (confirms the import fired and replaced the default layout)
    await expect(sectionSpans.filter({ hasText: 'Summary' })).toHaveCount(0)

    // Now verify the imported sections are present
    await expect(sectionSpans.filter({ hasText: 'Certifications' })).toHaveCount(1)
    await expect(sectionSpans.filter({ hasText: 'Languages' })).toHaveCount(1)

    // Default sections should be gone
    const labels = await sectionSpans.allTextContents()
    expect(labels).not.toContain('Experience')
  })

  test('importing an invalid JSON is a no-op (sections unchanged)', async ({ page }) => {
    const tmp = path.join(os.tmpdir(), `bad-layout-${Date.now()}.json`)
    fs.writeFileSync(tmp, 'this is not json at all')

    const sectionSpans = page.locator(
      '.border.border-gray-200.rounded-lg span.flex-1.text-sm.text-gray-800',
    )
    const before = await sectionSpans.allTextContents()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /↑ Import/i }).click(),
    ])
    await fileChooser.setFiles(tmp)
    fs.unlinkSync(tmp)

    // Wait briefly, then confirm nothing changed
    await page.waitForTimeout(300)
    const after = await sectionSpans.allTextContents()
    expect(after).toEqual(before)
  })
})
