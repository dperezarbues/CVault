'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { serializeForTypst, serializeLayout, usedIds } from '../layout-serializer'
import type { SectionDef } from '../section-defs'
import { loadLayoutOverride, persistLayoutOverride } from '../storage-helpers'
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

  // Restore any previously persisted layout for this template, falling back to the default
  const [restoredLayout] = useState(() => loadLayoutOverride(templateId) ?? initialLayout)
  const editorState = useEditorState(restoredLayout)
  const styling = useStyleState(initialLayout, styleParams, templateId)

  // Persist layout changes so they survive page refreshes and navigation
  useEffect(() => {
    persistLayoutOverride(
      templateId,
      serializeLayout(editorState.layout) as Record<string, unknown>,
    )
  }, [editorState.layout, templateId])

  const compiler = useCompiler({
    templateId,
    cvContent,
    getLayoutData: useCallback(
      () => serializeForTypst(editorState.layout, styling.style),
      [editorState.layout, styling.style],
    ),
    generateTrigger,
    onPdfChange,
    onGenerating,
  })

  const saved = useSavedConfigs({
    templateId,
    styleParams,
    getLayoutSnapshot: useCallback(() => serializeLayout(editorState.layout), [editorState.layout]),
    style: styling.style,
    onLoad: useCallback(
      (layout, style) => {
        editorState.setLayout(layout)
        styling.setStyle(style)
      },
      [editorState, styling],
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

  const hasSidebar = editorState.layout.sidebarSections !== undefined
  const sidebarSet = useMemo(
    () => new Set(editorState.layout.sidebarSections?.map((s) => s.id) ?? []),
    [editorState.layout.sidebarSections],
  )
  const usedInMain = useMemo(
    () => usedIds(editorState.layout.sections),
    [editorState.layout.sections],
  )
  const available = useMemo(
    () => allMainIds.filter((id) => !usedInMain.has(id) && !sidebarSet.has(id)),
    [allMainIds, usedInMain, sidebarSet],
  )
  const availableSb = useMemo(
    () => allSidebarIds.filter((id) => !sidebarSet.has(id)),
    [allSidebarIds, sidebarSet],
  )

  return {
    activePanel,
    setActivePanel,
    editor: {
      layout: editorState.layout,
      sensors: editorState.sensors,
      hasSidebar,
      available,
      availableSb,
      getLabel,
      setHeader: editorState.setHeader,
      updateSection: editorState.updateSection,
      handleDragEnd: editorState.handleDragEnd,
      handleSidebarDragEnd: editorState.handleSidebarDragEnd,
      addFullSection: editorState.addFullSection,
      addColumnsGroup: editorState.addColumnsGroup,
      removeSection: editorState.removeSection,
      updateColumn: editorState.updateColumn,
      updateSpacing: editorState.updateSpacing,
      addSidebarSection: editorState.addSidebarSection,
      removeSidebarSection: editorState.removeSidebarSection,
      toggleSidebarBreakable: editorState.toggleSidebarBreakable,
      updateSidebarSpacing: editorState.updateSidebarSpacing,
    },
    style: {
      style: styling.style,
      setStyleValue: styling.setStyleValue,
      resetStyle: styling.resetStyle,
    },
    compiler: {
      compileState: compiler.compileState,
      compilerReady: compiler.compilerReady,
      error: compiler.error,
      generate: compiler.generate,
    },
    saved: {
      saves: saved.saves,
      showSaveModal: saved.showSaveModal,
      setShowSaveModal: saved.setShowSaveModal,
      importRef: saved.importRef,
      mySavesCount: saved.mySavesCount,
      handleSave: saved.handleSave,
      handleLoad: saved.handleLoad,
      handleDelete: saved.handleDelete,
      handleImport: saved.handleImport,
    },
  }
}
