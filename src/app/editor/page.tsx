import fs from 'node:fs'
import path from 'node:path'
import TemplatesGallery from '../templates/TemplatesGallery'
import type { StyleParam, Template } from '../templates/types'

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function readLayout(templateId: string, layoutId: string): Record<string, unknown> | null {
  // Non-default templates use prefixed filenames (e.g. modern-default.json) to
  // avoid colliding with the default template's layout files (default.json etc.)
  const filename = templateId === 'default' ? layoutId : `${templateId}-${layoutId}`
  try {
    return readJson(path.join(process.cwd(), 'src', 'layouts', `${filename}.json`))
  } catch {
    return null
  }
}

export default function EditorPage() {
  const { sharedStyleParams, templates } = readJson<{
    sharedStyleParams: StyleParam[]
    templates: Template[]
  }>(path.join(process.cwd(), 'src', 'data', 'templates.json'))

  // Merge shared params (common to all templates) before template-specific ones
  const templatesData: Template[] = templates.map((t) => ({
    ...t,
    styleParams: [...sharedStyleParams, ...(t.styleParams ?? [])],
  }))

  const layoutData: Record<string, Record<string, Record<string, unknown>>> = {}
  for (const t of templatesData) {
    layoutData[t.id] = {}
    for (const l of t.layouts) {
      const raw = readLayout(t.id, l.id)
      if (raw) layoutData[t.id][l.id] = raw
    }
  }

  return <TemplatesGallery templates={templatesData} layoutData={layoutData} />
}
