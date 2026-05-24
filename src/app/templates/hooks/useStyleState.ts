'use client'

import { useState } from 'react'
import {
  clearStyleOverrides,
  loadStyleOverrides,
  parseStyleValues,
  persistStyleOverride,
} from '../editor-utils'
import type { StyleParam, StyleValues } from '../types'

export function useStyleState(initialLayout: Record<string, unknown>, styleParams: StyleParam[]) {
  const [style, setStyle] = useState<StyleValues>(() =>
    parseStyleValues(initialLayout, styleParams, loadStyleOverrides()),
  )

  function setStyleValue(key: string, value: string | number) {
    setStyle((prev) => ({ ...prev, [key]: value }))
    const param = styleParams.find((p) => p.key === key)
    persistStyleOverride(param?.canonical ?? key, value)
  }

  function resetStyle() {
    const defaults: StyleValues = {}
    for (const p of styleParams) defaults[p.key] = p.default
    setStyle(defaults)
    clearStyleOverrides(styleParams.map((p) => p.canonical ?? p.key))
  }

  return { style, setStyle, setStyleValue, resetStyle }
}
