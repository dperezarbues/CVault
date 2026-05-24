import fs from 'node:fs'
import path from 'node:path'
import type { StyleParam } from './LayoutEditor'
import TemplatesGallery from './TemplatesGallery'

type Layout = { id: string; name: string; description: string; pdf: string }
type Template = {
  id: string
  name: string
  description: string
  layouts: Layout[]
  styleParams?: StyleParam[]
}

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

export default function TemplatesPage() {
  const templatesData = readJson<Template[]>(
    path.join(process.cwd(), 'src', 'data', 'templates.json'),
  )

  // Pre-load all layout JSONs so the client gets them as plain objects
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
