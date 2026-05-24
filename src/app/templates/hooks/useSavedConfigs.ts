'use client'

import { useState, useRef, useMemo } from 'react'
import type { StyleParam, StyleValues, LayoutData, SavedConfig } from '../types'
import { loadSaves, persistSaves, serializeLayout, parseLayoutStructure, parseStyleValues } from '../editor-utils'
import type { LayoutStructure } from '../types'

export function useSavedConfigs({
  templateId,
  styleParams,
  getLayoutSnapshot,
  style,
  onLoad,
  onSaved,
}: {
  templateId: string
  styleParams: StyleParam[]
  getLayoutSnapshot: () => LayoutData
  style: StyleValues
  onLoad: (layout: LayoutStructure, style: StyleValues) => void
  onSaved: () => void
}) {
  const [saves, setSaves] = useState<SavedConfig[]>(() => loadSaves())
  const [showSaveModal, setShowSaveModal] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const mySavesCount = useMemo(
    () => saves.filter(s => s.templateId === templateId).length,
    [saves, templateId],
  )

  function handleSave(name: string) {
    const config: SavedConfig = {
      id: crypto.randomUUID(),
      name, templateId,
      savedAt: Date.now(),
      layout: getLayoutSnapshot(),
      style,
    }
    const updated = [...saves, config]
    setSaves(updated)
    persistSaves(updated)
    setShowSaveModal(false)
    onSaved()
  }

  function handleLoad(config: SavedConfig) {
    const raw = { ...config.layout, style: config.style } as Record<string, unknown>
    onLoad(parseLayoutStructure(raw), parseStyleValues(raw, styleParams))
  }

  function handleDelete(id: string) {
    const updated = saves.filter(s => s.id !== id)
    setSaves(updated)
    persistSaves(updated)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const raw = JSON.parse(ev.target?.result as string) as Record<string, unknown>
        onLoad(parseLayoutStructure(raw), parseStyleValues(raw, styleParams))
      } catch { /* ignore malformed files */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return {
    saves, showSaveModal, setShowSaveModal,
    importRef, mySavesCount,
    handleSave, handleLoad, handleDelete, handleImport,
  }
}
