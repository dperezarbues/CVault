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

export function loadStyleOverrides(): StyleOverrides {
  try {
    return JSON.parse(getItem(KEYS.styleOverrides) ?? '{}')
  } catch {
    return {}
  }
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
