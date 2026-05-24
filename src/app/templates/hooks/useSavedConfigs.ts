'use client'

import { useMemo, useRef, useState } from 'react'
import { parseLayoutStructure, parseStyleValues } from '../editor-utils'
import { LayoutImportSchema } from '../schemas'
import { loadSaves, persistSaves } from '../storage-helpers'
import type { LayoutData, LayoutStructure, SavedConfig, StyleParam, StyleValues } from '../types'

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
    () => saves.filter((s) => s.templateId === templateId).length,
    [saves, templateId],
  )

  function handleSave(name: string) {
    const config: SavedConfig = {
      id: crypto.randomUUID(),
      name,
      templateId,
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
    const updated = saves.filter((s) => s.id !== id)
    setSaves(updated)
    persistSaves(updated)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const result = LayoutImportSchema.safeParse(json)
        if (!result.success) return
        const raw = result.data as Record<string, unknown>
        onLoad(parseLayoutStructure(raw), parseStyleValues(raw, styleParams))
      } catch {
        /* ignore malformed files */
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return {
    saves,
    showSaveModal,
    setShowSaveModal,
    importRef,
    mySavesCount,
    handleSave,
    handleLoad,
    handleDelete,
    handleImport,
  }
}
