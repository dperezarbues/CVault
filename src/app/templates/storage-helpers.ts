import { getItem, KEYS, setItem } from '@/lib/storage'
import type { SavedConfig, StyleOverrides } from './types'

export function loadSaves(): SavedConfig[] {
  try {
    return JSON.parse(getItem(KEYS.saves) ?? '[]')
  } catch {
    return []
  }
}

export function persistSaves(saves: SavedConfig[]) {
  setItem(KEYS.saves, JSON.stringify(saves))
}

type ScopedOverrides = Record<string, StyleOverrides>

function readScoped(): ScopedOverrides {
  try {
    const raw = JSON.parse(getItem(KEYS.styleOverrides) ?? '{}') as Record<string, unknown>
    if (Object.keys(raw).length === 0) return {}
    // Detect old flat format: values are primitives rather than objects
    const firstVal = Object.values(raw)[0]
    if (typeof firstVal !== 'object' || firstVal === null) {
      // Migrate flat data into a "default" template bucket
      const migrated: ScopedOverrides = { default: raw as StyleOverrides }
      setItem(KEYS.styleOverrides, JSON.stringify(migrated))
      return migrated
    }
    return raw as ScopedOverrides
  } catch {
    return {}
  }
}

export function loadStyleOverrides(templateId: string): StyleOverrides {
  return readScoped()[templateId] ?? {}
}

export function persistStyleOverride(
  templateId: string,
  canonicalKey: string,
  value: string | number,
) {
  const scoped = readScoped()
  scoped[templateId] = { ...(scoped[templateId] ?? {}), [canonicalKey]: value }
  setItem(KEYS.styleOverrides, JSON.stringify(scoped))
}

export function clearStyleOverrides(templateId: string, canonicalKeys: string[]) {
  const scoped = readScoped()
  const bucket = { ...(scoped[templateId] ?? {}) }
  for (const k of canonicalKeys) delete bucket[k]
  scoped[templateId] = bucket
  setItem(KEYS.styleOverrides, JSON.stringify(scoped))
}

// ── Layout overrides ──────────────────────────────────────────────────────────

type ScopedLayouts = Record<string, Record<string, unknown>>

function readScopedLayouts(): ScopedLayouts {
  try {
    return JSON.parse(getItem(KEYS.layoutOverrides) ?? '{}') as ScopedLayouts
  } catch {
    return {}
  }
}

export function loadLayoutOverride(templateId: string): Record<string, unknown> | null {
  return readScopedLayouts()[templateId] ?? null
}

export function persistLayoutOverride(templateId: string, layout: Record<string, unknown>): void {
  const scoped = readScopedLayouts()
  scoped[templateId] = layout
  setItem(KEYS.layoutOverrides, JSON.stringify(scoped))
}

export function clearLayoutOverride(templateId: string): void {
  const scoped = readScopedLayouts()
  delete scoped[templateId]
  setItem(KEYS.layoutOverrides, JSON.stringify(scoped))
}
