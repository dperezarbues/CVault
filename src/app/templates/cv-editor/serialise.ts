import type { ContactItem, CvFormData, GenericItem, SkillGroup } from './types'

const toLines = (arr: unknown): string =>
  Array.isArray(arr) ? (arr as string[]).filter(Boolean).join('\n') : ''

const fromLines = (s: string): string[] =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const toCommas = (arr: unknown): string =>
  Array.isArray(arr) ? (arr as string[]).filter(Boolean).join(', ') : ''

const fromCommas = (s: string): string[] =>
  s
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)

function parseItem(raw: Record<string, unknown>): GenericItem {
  return {
    title: String(raw.title ?? ''),
    subtitle: String(raw.subtitle ?? ''),
    period: String(raw.period ?? ''),
    description: String(raw.description ?? ''),
    highlights: toLines(raw.highlights),
    tags: toCommas(raw.tags),
  }
}

function serializeItem(item: GenericItem): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (item.title) out.title = item.title
  if (item.subtitle) out.subtitle = item.subtitle
  if (item.period) out.period = item.period
  if (item.description) out.description = item.description
  const hl = fromLines(item.highlights)
  if (hl.length) out.highlights = hl
  const tags = fromCommas(item.tags)
  if (tags.length) out.tags = tags
  return out
}

function parseItems(arr: unknown): GenericItem[] {
  return Array.isArray(arr) ? (arr as Record<string, unknown>[]).map(parseItem) : []
}

function parseSkills(arr: unknown): SkillGroup[] {
  if (!Array.isArray(arr)) return []
  return (arr as Record<string, unknown>[]).map((g) => ({
    name: String(g.name ?? ''),
    entries: toCommas(g.entries),
  }))
}

function parseLanguages(arr: unknown): GenericItem[] {
  if (!Array.isArray(arr)) return []
  return (arr as Record<string, unknown>[]).map((l) => ({
    title: String(l.title ?? l.language ?? ''),
    subtitle: String(l.subtitle ?? l.level ?? ''),
    period: '',
    description: '',
    highlights: '',
    tags: '',
  }))
}

export function jsonToCvForm(raw: Record<string, unknown>): CvFormData {
  const identity = (raw.identity ?? {}) as Record<string, unknown>

  let contact: ContactItem[] = []
  if (Array.isArray(identity.contact)) {
    contact = (identity.contact as Record<string, unknown>[]).map((c) => ({
      type: String(c.type ?? 'web'),
      key: String(c.key ?? ''),
      value: String(c.value ?? ''),
    }))
  }

  return {
    identity: {
      name: String(identity.name ?? ''),
      headline: String(identity.headline ?? ''),
      contact,
    },
    summary: String(raw.summary ?? ''),
    experience: parseItems(raw.experience),
    education: parseItems(raw.education),
    skills: parseSkills(raw.skills),
    languages: parseLanguages(raw.languages),
    certifications: parseItems(raw.certifications),
    side_projects: parseItems(raw.side_projects),
    awards: parseItems(raw.awards),
  }
}

export function cvFormToJson(form: CvFormData): Record<string, unknown> {
  const result: Record<string, unknown> = {
    identity: {
      name: form.identity.name,
      headline: form.identity.headline,
      contact: form.identity.contact.filter((c) => c.value.trim()),
    },
  }

  if (form.summary.trim()) result.summary = form.summary.trim()

  const ser = (items: GenericItem[]) =>
    items.map(serializeItem).filter((i) => Object.keys(i).length > 0)

  if (form.experience.length) result.experience = ser(form.experience)
  if (form.education.length) result.education = ser(form.education)
  if (form.skills.length) {
    result.skills = form.skills
      .filter((g) => g.name)
      .map((g) => ({ name: g.name, entries: fromCommas(g.entries) }))
  }
  if (form.languages.length) {
    result.languages = form.languages
      .filter((l) => l.title)
      .map((l) => ({ title: l.title, subtitle: l.subtitle }))
  }
  if (form.certifications.length) result.certifications = ser(form.certifications)
  if (form.side_projects.length) result.side_projects = ser(form.side_projects)
  if (form.awards.length) result.awards = ser(form.awards)

  return result
}

export function initFormData(content: string): CvFormData | null {
  try {
    return jsonToCvForm(JSON.parse(content) as Record<string, unknown>)
  } catch {
    return null
  }
}
