'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { compileTypst, isCompilerReady, onCompilerReady } from '@/lib/typst-compile'
import QRCode from 'qrcode'
import type { SectionDef } from '../section-defs'
import type { EditorState, EditorSection, CompileState, SavedConfig, StyleParam } from '../types'
import {
  loadSaves, persistSaves, loadStyleOverrides, persistStyleOverride, clearStyleOverrides,
  serializeForTypst, serializeLayout, parseLayout, usedIds,
} from '../editor-utils'

export function useLayoutEditor({
  initialLayout, templateId, styleParams = [], sections = [],
  cvContent, generateTrigger = 0, onPdfChange, onGenerating,
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
  const [state, setState] = useState<EditorState>(() => parseLayout(initialLayout, styleParams, loadStyleOverrides()))
  const [compileState, setCompileState] = useState<CompileState>('idle')
  const [compilerReady, setCompilerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [activePanel, setActivePanel] = useState<'layout' | 'style' | 'saved'>('layout')
  const [saves, setSaves] = useState<SavedConfig[]>(() => loadSaves())
  const importRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const allMainIds    = useMemo(() => sections.filter(s => s.locations.includes('main')).map(s => s.id), [sections])
  const allSidebarIds = useMemo(() => sections.filter(s => s.locations.includes('sidebar')).map(s => s.id), [sections])
  const labelMap      = useMemo(() => Object.fromEntries(sections.map(s => [s.id, s.label])), [sections])
  const getLabel      = useCallback((id: string) => labelMap[id] ?? id, [labelMap])

  const hasSidebar   = state.sidebarSections !== undefined
  const sidebarSet   = new Set(state.sidebarSections?.map(s => s.id) ?? [])
  const available    = allMainIds.filter(id => !usedIds(state.sections).has(id) && !sidebarSet.has(id))
  const availableSb  = allSidebarIds.filter(id => !sidebarSet.has(id))
  const mySavesCount = saves.filter(s => s.templateId === templateId).length

  // ── Section helpers ───────────────────────────────────────────────────────────

  function updateSection(key: string, fn: (s: EditorSection) => EditorSection) {
    setState(prev => ({ ...prev, sections: prev.sections.map(s => s.key === key ? fn(s) : s) }))
  }
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setState(prev => {
      const from = prev.sections.findIndex(s => s.key === String(active.id))
      const to   = prev.sections.findIndex(s => s.key === String(over.id))
      return { ...prev, sections: arrayMove(prev.sections, from, to) }
    })
  }
  function handleSidebarDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setState(prev => {
      const sbs  = prev.sidebarSections!
      const from = sbs.findIndex(s => s.id === String(active.id))
      const to   = sbs.findIndex(s => s.id === String(over.id))
      return { ...prev, sidebarSections: arrayMove(sbs, from, to) }
    })
  }
  function addFullSection(id: string) {
    setState(prev => ({ ...prev, sections: [...prev.sections, { kind: 'full', key: id, id, breakable: true }] }))
  }
  function addColumnsGroup() {
    const key = `columns-${Date.now()}`
    setState(prev => ({ ...prev, sections: [...prev.sections, { kind: 'columns', key, columns: 2, content: [[], []], breakable: true }] }))
  }
  function removeSection(key: string) {
    setState(prev => ({ ...prev, sections: prev.sections.filter(s => s.key !== key) }))
  }
  function updateColumn(key: string, ci: number, cols: string[]) {
    updateSection(key, s => s.kind !== 'columns' ? s : { ...s, content: s.content.map((c, i) => i === ci ? cols : c) })
  }
  function updateSpacing(key: string, pre: number | undefined, post: number | undefined) {
    updateSection(key, s => {
      const next = { ...s }
      if (pre  === undefined) delete (next as Record<string, unknown>).pre_spacing
      else next.pre_spacing = pre
      if (post === undefined) delete (next as Record<string, unknown>).post_spacing
      else next.post_spacing = post
      return next
    })
  }

  // ── Sidebar helpers ───────────────────────────────────────────────────────────

  function addSidebarSection(id: string) {
    setState(prev => ({ ...prev, sidebarSections: [...prev.sidebarSections!, { id, breakable: true }] }))
  }
  function removeSidebarSection(id: string) {
    setState(prev => ({ ...prev, sidebarSections: prev.sidebarSections!.filter(s => s.id !== id) }))
  }
  function toggleSidebarBreakable(id: string) {
    setState(prev => ({ ...prev, sidebarSections: prev.sidebarSections!.map(s => s.id === id ? { ...s, breakable: !s.breakable } : s) }))
  }
  function updateSidebarSpacing(id: string, pre: number | undefined, post: number | undefined) {
    setState(prev => ({
      ...prev,
      sidebarSections: prev.sidebarSections!.map(s => {
        if (s.id !== id) return s
        const next = { ...s }
        if (pre  === undefined) delete (next as Record<string, unknown>).pre_spacing
        else next.pre_spacing = pre
        if (post === undefined) delete (next as Record<string, unknown>).post_spacing
        else next.post_spacing = post
        return next
      }),
    }))
  }

  // ── Style helpers ─────────────────────────────────────────────────────────────

  function setStyleValue(key: string, value: string | number) {
    setState(prev => ({ ...prev, style: { ...prev.style, [key]: value } }))
    const param = styleParams.find(p => p.key === key)
    persistStyleOverride(param?.canonical ?? key, value)
  }
  function setHeaderStyle(style: 'split' | 'stacked') {
    setState(prev => ({ ...prev, header: { style } }))
  }
  function resetStyle() {
    const defaults: Record<string, string | number> = {}
    for (const p of styleParams) defaults[p.key] = p.default
    setState(prev => ({ ...prev, style: defaults }))
    clearStyleOverrides(styleParams.map(p => p.canonical ?? p.key))
  }

  // ── Save / load ───────────────────────────────────────────────────────────────

  function handleSave(name: string) {
    const config: SavedConfig = {
      id: crypto.randomUUID(),
      name, templateId,
      savedAt: Date.now(),
      layout: serializeLayout(state),
      style: state.style,
    }
    const updated = [...saves, config]
    setSaves(updated)
    persistSaves(updated)
    setShowSaveModal(false)
    setActivePanel('saved')
  }
  function handleLoad(config: SavedConfig) {
    const merged = { ...config.layout as object, style: config.style }
    setState(parseLayout(merged as Record<string, unknown>, styleParams))
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
        const raw = JSON.parse(ev.target?.result as string)
        setState(parseLayout(raw as Record<string, unknown>, styleParams))
      } catch { /* ignore malformed files */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Generate ──────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (compileState !== 'idle') return
    setError(null)
    const layoutData = serializeForTypst(state)

    let qrSvg: string | undefined
    const style = (layoutData as { style?: Record<string, unknown> }).style ?? {}
    if (style.show_qr === 'true' || style.show_qr === true) {
      let qrUrl = String(style.qr_url ?? '').trim()
      if (!qrUrl) {
        try {
          const cv = JSON.parse(cvContent) as { identity?: { contact?: Array<{ type: string; value: string }>; linkedin?: string } }
          const contact = cv.identity?.contact ?? []
          const entry = contact.find(e => e.type === 'linkedin')
          const val = entry?.value ?? cv.identity?.linkedin ?? ''
          qrUrl = val ? (val.startsWith('http') ? val : `https://${val}`) : 'https://linkedin.com'
        } catch { qrUrl = 'https://linkedin.com' }
      }
      qrSvg = await QRCode.toString(qrUrl, { type: 'svg', margin: 0 })
    }

    setCompileState(isCompilerReady() ? 'compiling' : 'loading')
    onGenerating(true)
    if (!isCompilerReady()) onCompilerReady(() => setCompileState('compiling'))

    try {
      const url = await compileTypst({ templateId, cvContent, layoutJson: JSON.stringify(layoutData), qrSvg })
      onPdfChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCompileState('idle')
      onGenerating(false)
    }
  }

  useEffect(() => {
    if (isCompilerReady()) { setCompilerReady(true); return }
    onCompilerReady(() => setCompilerReady(true))
  }, [])

  // Auto-generate when parent increments the trigger (e.g. after first CV save)
  useEffect(() => {
    if (generateTrigger > 0 && compileState === 'idle' && cvContent) handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateTrigger])

  return {
    state, compileState, compilerReady, error,
    showSaveModal, setShowSaveModal,
    activePanel, setActivePanel,
    saves, importRef, sensors,
    hasSidebar, sidebarSet, available, availableSb, mySavesCount,
    getLabel,
    setHeaderStyle,
    handleDragEnd, handleSidebarDragEnd,
    addFullSection, addColumnsGroup, removeSection, updateColumn, updateSpacing,
    addSidebarSection, removeSidebarSection, toggleSidebarBreakable, updateSidebarSpacing,
    setStyleValue, resetStyle,
    handleSave, handleLoad, handleDelete, handleImport,
    handleGenerate, updateSection,
  }
}
