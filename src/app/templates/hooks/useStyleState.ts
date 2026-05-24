'use client'

import { useState } from 'react'
import { parseStyleValues } from '../layout-serializer'
import { clearStyleOverrides, loadStyleOverrides, persistStyleOverride } from '../storage-helpers'
import type { StyleParam, StyleValues } from '../types'

export function useStyleState(
  initialLayout: Record<string, unknown>,
  styleParams: StyleParam[],
  templateId: string,
) {
  const [style, setStyle] = useState<StyleValues>(() =>
    parseStyleValues(initialLayout, styleParams, loadStyleOverrides(templateId)),
  )

  function setStyleValue(key: string, value: string | number) {
    setStyle((prev) => ({ ...prev, [key]: value }))
    const param = styleParams.find((p) => p.key === key)
    persistStyleOverride(templateId, param?.canonical ?? key, value)
  }

  function resetStyle() {
    const defaults: StyleValues = {}
    for (const p of styleParams) defaults[p.key] = p.default
    setStyle(defaults)
    clearStyleOverrides(
      templateId,
      styleParams.map((p) => p.canonical ?? p.key),
    )
  }

  return { style, setStyle, setStyleValue, resetStyle }
}
