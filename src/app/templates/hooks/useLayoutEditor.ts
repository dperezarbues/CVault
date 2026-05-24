'use client'

import { useCallback, useMemo, useState } from 'react'
import { serializeForTypst, serializeLayout, usedIds } from '../editor-utils'
import type { SectionDef } from '../section-defs'
import type { Panel, StyleParam } from '../types'
import { useCompiler } from './useCompiler'
import { useEditorState } from './useEditorState'
import { useSavedConfigs } from './useSavedConfigs'
import { useStyleState } from './useStyleState'

export function useLayoutEditor({
  initialLayout,
  templateId,
  styleParams = [],
  sections = [],
  cvContent,
  generateTrigger = 0,
  onPdfChange,
  onGenerating,
}: {
  initialLayout: Record<string, unknown>
  templateId: string
  styleParams?: StyleParam[]
  sections?: SectionDef[]
  cvContent: string
  generateTrigger?: number
  onPdfChange: (url: string) => void
  onGenerating: (v: boolean) => void
}) {
  const [activePanel, setActivePanel] = useState<Panel>('layout')

  const editor = useEditorState(initialLayout)
  const styling = useStyleState(initialLayout, styleParams)

  const compiler = useCompiler({
    templateId,
    cvContent,
    getLayoutData: useCallback(
      () => serializeForTypst(editor.layout, styling.style),
      [editor.layout, styling.style],
    ),
    generateTrigger,
    onPdfChange,
    onGenerating,
  })

  const saved = useSavedConfigs({
    templateId,
    styleParams,
    getLayoutSnapshot: useCallback(() => serializeLayout(editor.layout), [editor.layout]),
    style: styling.style,
    onLoad: useCallback(
      (layout, style) => {
        editor.setLayout(layout)
        styling.setStyle(style)
      },
      [editor, styling],
    ),
    onSaved: useCallback(() => setActivePanel('saved'), []),
  })

  // ── Derived values ────────────────────────────────────────────────────────────

  const allMainIds = useMemo(
    () => sections.filter((s) => s.locations.includes('main')).map((s) => s.id),
    [sections],
  )
  const allSidebarIds = useMemo(
    () => sections.filter((s) => s.locations.includes('sidebar')).map((s) => s.id),
    [sections],
  )
  const labelMap = useMemo(
    () => Object.fromEntries(sections.map((s) => [s.id, s.label])),
    [sections],
  )
  const getLabel = useCallback((id: string) => labelMap[id] ?? id, [labelMap])

  const hasSidebar = editor.layout.sidebarSections !== undefined
  const sidebarSet = useMemo(
    () => new Set(editor.layout.sidebarSections?.map((s) => s.id) ?? []),
    [editor.layout.sidebarSections],
  )
  const usedInMain = useMemo(() => usedIds(editor.layout.sections), [editor.layout.sections])
  const available = useMemo(
    () => allMainIds.filter((id) => !usedInMain.has(id) && !sidebarSet.has(id)),
    [allMainIds, usedInMain, sidebarSet],
  )
  const availableSb = useMemo(
    () => allSidebarIds.filter((id) => !sidebarSet.has(id)),
    [allSidebarIds, sidebarSet],
  )

  return {
    // State
    layout: editor.layout,
    style: styling.style,
    activePanel,
    setActivePanel,
    // Editor sensors (from useEditorState)
    sensors: editor.sensors,
    // Derived
    hasSidebar,
    sidebarSet,
    available,
    availableSb,
    getLabel,
    // Compiler
    compileState: compiler.compileState,
    compilerReady: compiler.compilerReady,
    error: compiler.error,
    handleGenerate: compiler.generate,
    // Saved configs
    saves: saved.saves,
    showSaveModal: saved.showSaveModal,
    setShowSaveModal: saved.setShowSaveModal,
    importRef: saved.importRef,
    mySavesCount: saved.mySavesCount,
    handleSave: saved.handleSave,
    handleLoad: saved.handleLoad,
    handleDelete: saved.handleDelete,
    handleImport: saved.handleImport,
    // Layout mutations (from useEditorState)
    setHeader: editor.setHeader,
    updateSection: editor.updateSection,
    handleDragEnd: editor.handleDragEnd,
    handleSidebarDragEnd: editor.handleSidebarDragEnd,
    addFullSection: editor.addFullSection,
    addColumnsGroup: editor.addColumnsGroup,
    removeSection: editor.removeSection,
    updateColumn: editor.updateColumn,
    updateSpacing: editor.updateSpacing,
    addSidebarSection: editor.addSidebarSection,
    removeSidebarSection: editor.removeSidebarSection,
    toggleSidebarBreakable: editor.toggleSidebarBreakable,
    updateSidebarSpacing: editor.updateSidebarSpacing,
    // Style mutations (from useStyleState)
    setStyleValue: styling.setStyleValue,
    resetStyle: styling.resetStyle,
  }
}
