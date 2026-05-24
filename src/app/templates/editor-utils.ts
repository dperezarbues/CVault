import { createContext } from 'react'
import { getItem, setItem, KEYS } from '@/lib/storage'
import type { EditorState, EditorSection, SidebarSection, SavedConfig, StyleParam, StyleOverrides, StyleValues } from './types'

export const DEFAULT_PRE  = 0.50
export const DEFAULT_POST = 0.20

export const LabelCtx = createContext<(id: string) => string>(id => id)

// ── Storage helpers ───────────────────────────────────────────────────────────

export function loadSaves(): SavedConfig[] {
  try { return JSON.parse(getItem(KEYS.saves) ?? '[]') } catch { return [] }
}
export function persistSaves(saves: SavedConfig[]) {
  setItem(KEYS.saves, JSON.stringify(saves))
}

export function loadStyleOverrides(): StyleOverrides {
  try { return JSON.parse(getItem(KEYS.styleOverrides) ?? '{}') } catch { return {} }
}
export function persistStyleOverride(canonicalKey: string, value: string | number) {
  const overrides = loadStyleOverrides()
  overrides[canonicalKey] = value
  setItem(KEYS.styleOverrides, JSON.stringify(overrides))
}
export function clearStyleOverrides(canonicalKeys: string[]) {
  const overrides = loadStyleOverrides()
  for (const k of canonicalKeys) delete overrides[k]
  setItem(KEYS.styleOverrides, JSON.stringify(overrides))
}

// ── Serialization ─────────────────────────────────────────────────────────────

export function serializeLayout(state: EditorState): object {
  return {
    header: state.header,
    ...(state.sidebarSections !== undefined && {
      sidebar_sections: state.sidebarSections.map(s => ({
        id: s.id, breakable: s.breakable,
        ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  }),
        ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
      })),
    }),
    sections: state.sections.map(s =>
      s.kind === 'full'
        ? {
            id: s.id, breakable: s.breakable,
            ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          }
        : {
            type: 'columns', columns: s.columns, content: s.content, breakable: s.breakable,
            ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          },
    ),
  }
}

export function serializeForTypst(state: EditorState): object {
  return {
    ...serializeLayout(state),
    ...(Object.keys(state.style).length > 0 && { style: state.style }),
  }
}

export function parseLayout(raw: Record<string, unknown>, styleParams: StyleParam[], overrides?: StyleOverrides): EditorState {
  const rawSections = (raw.sections as Record<string, unknown>[]) ?? []
  let colIdx = 0
  const sections: EditorSection[] = rawSections.map(s => {
    if (s.type === 'columns') {
      return {
        kind: 'columns' as const, key: `columns-${colIdx++}`,
        columns: (s.columns as number) ?? 2,
        content: (s.content as string[][]) ?? [[], []],
        breakable: (s.breakable as boolean) ?? true,
        ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  as number }),
        ...(s.post_spacing != null && { post_spacing: s.post_spacing as number }),
      }
    }
    return {
      kind: 'full' as const, key: s.id as string, id: s.id as string,
      breakable: (s.breakable as boolean) ?? true,
      ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  as number }),
      ...(s.post_spacing != null && { post_spacing: s.post_spacing as number }),
    }
  })

  let sidebarSections: SidebarSection[] | undefined
  if (raw.sidebar_sections != null) {
    sidebarSections = (raw.sidebar_sections as Array<string | { id: string; breakable?: boolean; pre_spacing?: number; post_spacing?: number }>).map(s =>
      typeof s === 'string'
        ? { id: s, breakable: true }
        : {
            id: s.id, breakable: s.breakable ?? true,
            ...(s.pre_spacing  != null && { pre_spacing:  s.pre_spacing  }),
            ...(s.post_spacing != null && { post_spacing: s.post_spacing }),
          },
    )
  }

  const rawStyle = (raw.style as StyleValues) ?? {}
  const style: StyleValues = {}
  for (const p of styleParams) {
    const ck = p.canonical ?? p.key
    const override = overrides?.[p.key] ?? overrides?.[ck]
    if (p.type === 'range') {
      const v = rawStyle[p.key] ?? override
      style[p.key] = typeof v === 'number' ? v : p.default
    } else {
      style[p.key] = (rawStyle[p.key] as string | undefined) ?? (override as string | undefined) ?? p.default
    }
  }

  return {
    header: (raw.header as { style: 'split' | 'stacked' }) ?? { style: 'stacked' },
    sidebarSections, sections, style,
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
