import { createContext } from 'react'
import type {
  EditorSection,
  LayoutData,
  LayoutStructure,
  SidebarSection,
  StyleOverrides,
  StyleParam,
  StyleValues,
} from './types'

export const DEFAULT_PRE = 0.5
export const DEFAULT_POST = 0.2

export const LabelCtx = createContext<(id: string) => string>((id) => id)

// ── Serialization ─────────────────────────────────────────────────────────────

export function serializeLayout(layout: LayoutStructure): LayoutData {
  return {
    header: layout.header,
    ...(layout.sidebarSections !== undefined && {
      sidebar_sections: layout.sidebarSections.map((s) => ({
        id: s.id,
        breakable: s.breakable,
        ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing }),
        ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
      })),
    }),
    sections: layout.sections.map((s) =>
      s.kind === 'full'
        ? {
            id: s.id,
            breakable: s.breakable,
            ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          }
        : {
            type: 'columns' as const,
            columns: s.columns,
            content: s.content,
            breakable: s.breakable,
            ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          },
    ),
  }
}

export function serializeForTypst(
  layout: LayoutStructure,
  style: StyleValues,
): LayoutData & { style?: StyleValues } {
  return {
    ...serializeLayout(layout),
    ...(Object.keys(style).length > 0 && { style }),
  }
}

// ── Parsing ───────────────────────────────────────────────────────────────────

export function parseLayoutStructure(raw: Record<string, unknown>): LayoutStructure {
  const rawSections = (raw.sections as Record<string, unknown>[]) ?? []
  let colIdx = 0
  const sections: EditorSection[] = rawSections.map((s) => {
    if (s.type === 'columns') {
      return {
        kind: 'columns' as const,
        key: `columns-${colIdx++}`,
        columns: (s.columns as number) ?? 2,
        content: (s.content as string[][]) ?? [[], []],
        breakable: (s.breakable as boolean) ?? true,
        ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing as number }),
        ...(s.post_spacing != null && { post_spacing: s.post_spacing as number }),
      }
    }
    return {
      kind: 'full' as const,
      key: s.id as string,
      id: s.id as string,
      breakable: (s.breakable as boolean) ?? true,
      ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing as number }),
      ...(s.post_spacing != null && { post_spacing: s.post_spacing as number }),
    }
  })

  let sidebarSections: SidebarSection[] | undefined
  if (raw.sidebar_sections != null) {
    sidebarSections = (
      raw.sidebar_sections as Array<
        string | { id: string; breakable?: boolean; pre_spacing?: number; post_spacing?: number }
      >
    ).map((s) =>
      typeof s === 'string'
        ? { id: s, breakable: true }
        : {
            id: s.id,
            breakable: s.breakable ?? true,
            ...(s.pre_spacing != null && { pre_spacing: s.pre_spacing }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          },
    )
  }

  return {
    header: (raw.header as LayoutStructure['header']) ?? { style: 'stacked' },
    sidebarSections,
    sections,
  }
}

export function parseStyleValues(
  raw: Record<string, unknown>,
  styleParams: StyleParam[],
  overrides?: StyleOverrides,
): StyleValues {
  const rawStyle = (raw.style as StyleValues) ?? {}
  const style: StyleValues = {}
  for (const p of styleParams) {
    const ck = p.canonical ?? p.key
    const override = overrides?.[p.key] ?? overrides?.[ck]
    if (p.type === 'range') {
      const v = rawStyle[p.key] ?? override
      style[p.key] = typeof v === 'number' ? v : p.default
    } else {
      style[p.key] =
        (rawStyle[p.key] as string | undefined) ?? (override as string | undefined) ?? p.default
    }
  }
  return style
}

// ── QR code ───────────────────────────────────────────────────────────────────

/** Resolves the URL to encode as a QR code. Falls back to the LinkedIn contact entry, then a placeholder. */
export function resolveQrUrl(cvContent: string, style: Record<string, unknown>): string {
  const explicit = String(style.qr_url ?? '').trim()
  if (explicit) return explicit
  try {
    const cv = JSON.parse(cvContent) as {
      identity?: { contact?: Array<{ type: string; value: string }>; linkedin?: string }
    }
    const contact = cv.identity?.contact ?? []
    const linkedinEntry = contact.find((e) => e.type === 'linkedin')
    const val = linkedinEntry?.value ?? cv.identity?.linkedin ?? ''
    return val ? (val.startsWith('http') ? val : `https://${val}`) : 'https://linkedin.com'
  } catch {
    return 'https://linkedin.com'
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function usedIds(sections: EditorSection[]): Set<string> {
  const used = new Set<string>()
  for (const s of sections) {
    if (s.kind === 'full') used.add(s.id)
    else for (const col of s.content) for (const id of col) used.add(id)
  }
  return used
}
