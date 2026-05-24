'use client'

import { useState, useEffect, useRef, createContext, useContext, useMemo, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { compileTypst, isCompilerReady, onCompilerReady } from '@/lib/typst-compile'
import QRCode from 'qrcode'
import { getItem, setItem, KEYS } from '@/lib/storage'

// ── Section registry ──────────────────────────────────────────────────────────

export type { SectionDef } from './section-defs'
export { DEFAULT_SECTIONS } from './section-defs'
import type { SectionDef } from './section-defs'
import { DEFAULT_SECTIONS } from './section-defs'

const LabelCtx = createContext<(id: string) => string>(id => id)

// ── Types ─────────────────────────────────────────────────────────────────────

type StyleParamBase = { key: string; label: string; group?: string; canonical?: string }

export type StyleParam =
  | StyleParamBase & { type: 'color';  default: string }
  | StyleParamBase & { type: 'range';  min: number; max: number; step: number; unit: string; default: number }
  | StyleParamBase & { type: 'select'; options: Array<{ label: string; value: string }>; default: string }
  | StyleParamBase & { type: 'toggle'; default: string }
  | StyleParamBase & { type: 'text';   placeholder?: string; default: string }

type StyleValues = Record<string, string | number>

type FullSection    = { kind: 'full';    key: string; id: string; breakable: boolean; pre_spacing?: number; post_spacing?: number }
type ColumnsSection = { kind: 'columns'; key: string; columns: number; content: string[][]; breakable: boolean; pre_spacing?: number; post_spacing?: number }
type EditorSection  = FullSection | ColumnsSection
type SidebarSection = { id: string; breakable: boolean; pre_spacing?: number; post_spacing?: number }

type EditorState = {
  header: { style: 'split' | 'stacked' }
  sidebarSections?: SidebarSection[]
  sections: EditorSection[]
  style: StyleValues
}

type SavedConfig = {
  id: string
  name: string
  templateId: string
  savedAt: number
  layout: object    // structure only (no style)
  style: StyleValues
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadSaves(): SavedConfig[] {
  try { return JSON.parse(getItem(KEYS.saves) ?? '[]') } catch { return [] }
}
function persistSaves(saves: SavedConfig[]) {
  setItem(KEYS.saves, JSON.stringify(saves))
}

// ── Cross-template style overrides ───────────────────────────────────────────
// Keyed by canonical name (or plain key when canonical is absent).
// Survives template switches so shared settings (font, toggles, accent colours) carry over.

type StyleOverrides = Record<string, string | number>

function loadStyleOverrides(): StyleOverrides {
  try { return JSON.parse(getItem(KEYS.styleOverrides) ?? '{}') } catch { return {} }
}
function persistStyleOverride(canonicalKey: string, value: string | number) {
  const overrides = loadStyleOverrides()
  overrides[canonicalKey] = value
  setItem(KEYS.styleOverrides, JSON.stringify(overrides))
}
function clearStyleOverrides(canonicalKeys: string[]) {
  const overrides = loadStyleOverrides()
  for (const k of canonicalKeys) delete overrides[k]
  setItem(KEYS.styleOverrides, JSON.stringify(overrides))
}

// ── Serialization: layout (structure) vs style (visual) ───────────────────────

function serializeLayout(state: EditorState): object {
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

function serializeForTypst(state: EditorState): object {
  return {
    ...serializeLayout(state),
    ...(Object.keys(state.style).length > 0 && { style: state.style }),
  }
}

// ── Parse ─────────────────────────────────────────────────────────────────────

function parseLayout(raw: Record<string, unknown>, styleParams: StyleParam[], overrides?: StyleOverrides): EditorState {
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

// ── Download helper ───────────────────────────────────────────────────────────

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SortableSidebarChip({ item, onRemove, onToggleBreakable, onSpacingChange }: {
  item: SidebarSection; onRemove: () => void; onToggleBreakable: () => void
  onSpacingChange: (pre: number | undefined, post: number | undefined) => void
}) {
  const getLabel = useContext(LabelCtx)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [spacingOpen, setSpacingOpen] = useState(item.pre_spacing != null || item.post_spacing != null)
  const DEFAULT_PRE  = 0.50
  const DEFAULT_POST = 0.20
  const curPre  = item.pre_spacing  ?? DEFAULT_PRE
  const curPost = item.post_spacing ?? DEFAULT_POST
  const hasCustomSpacing = item.pre_spacing != null || item.post_spacing != null
  function toggleSpacing() {
    if (spacingOpen && hasCustomSpacing) onSpacingChange(undefined, undefined)
    setSpacingOpen(x => !x)
  }
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 group"
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none text-base leading-none px-0.5">⠿</button>
        <span className="flex-1 text-sm text-gray-800">{getLabel(item.id)}</span>
        <button onClick={toggleSpacing}
          className={`text-xs px-1 leading-none transition-colors ${hasCustomSpacing ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}
          title="Per-section spacing">↕</button>
        <label className="flex items-center gap-1 text-xs text-gray-400 select-none cursor-pointer">
          <input type="checkbox" checked={item.breakable} onChange={onToggleBreakable} className="w-3 h-3 accent-blue-500" />
          <span>break</span>
        </label>
        <button onClick={onRemove} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none">×</button>
      </div>
      {spacingOpen && (
        <SpacingRow pre={curPre} post={curPost}
          onChange={(pre, post) => onSpacingChange(pre, post)}
          onClear={() => { onSpacingChange(undefined, undefined); setSpacingOpen(false) }} />
      )}
    </div>
  )
}

function ColumnSlot({ label, sections, available, onRemove, onAdd }: {
  label: string; sections: string[]; available: string[]
  onRemove: (i: number) => void; onAdd: (id: string) => void
}) {
  const getLabel = useContext(LabelCtx)
  return (
    <div className="bg-gray-50 rounded p-2 min-h-16">
      <p className="text-xs font-medium text-gray-400 mb-1.5">{label}</p>
      <div className="space-y-1">
        {sections.map((id, i) => (
          <div key={id} className="flex items-center justify-between px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
            <span>{getLabel(id)}</span>
            <button onClick={() => onRemove(i)} className="text-gray-300 hover:text-red-400 ml-2">×</button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <select className="mt-1.5 w-full text-xs border border-dashed border-gray-300 rounded px-1.5 py-1 text-gray-400 bg-white"
          value="" onChange={e => { if (e.target.value) onAdd(e.target.value) }}>
          <option value="">+ add section</option>
          {available.map(id => <option key={id} value={id}>{getLabel(id)}</option>)}
        </select>
      )}
    </div>
  )
}

function SpacingRow({ pre, post, onChange, onClear }: {
  pre: number; post: number
  onChange: (pre: number, post: number) => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
      <span className="shrink-0">↕</span>
      <label className="flex items-center gap-1 shrink-0">
        <span>before</span>
        <input type="number" min={0.05} max={2} step={0.05} value={pre.toFixed(2)}
          onChange={e => onChange(parseFloat(e.target.value) || pre, post)}
          className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white" />
        <span>em</span>
      </label>
      <label className="flex items-center gap-1 shrink-0">
        <span>after</span>
        <input type="number" min={0.05} max={2} step={0.05} value={post.toFixed(2)}
          onChange={e => onChange(pre, parseFloat(e.target.value) || post)}
          className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white" />
        <span>em</span>
      </label>
      <button onClick={onClear} className="ml-auto text-gray-300 hover:text-red-400 leading-none" title="Reset to template default">×</button>
    </div>
  )
}

function SortableCard({ item, available, onToggleBreakable, onRemove, onUpdateColumn, onSpacingChange }: {
  item: EditorSection; available: string[]
  onToggleBreakable: () => void; onRemove: () => void
  onUpdateColumn: (ci: number, secs: string[]) => void
  onSpacingChange: (pre: number | undefined, post: number | undefined) => void
}) {
  const getLabel = useContext(LabelCtx)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key })
  const [expanded, setExpanded] = useState(false)
  const [spacingOpen, setSpacingOpen] = useState(item.pre_spacing != null || item.post_spacing != null)
  const s = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }

  const DEFAULT_PRE  = 0.50
  const DEFAULT_POST = 0.20
  const curPre  = item.pre_spacing  ?? DEFAULT_PRE
  const curPost = item.post_spacing ?? DEFAULT_POST
  const hasCustomSpacing = item.pre_spacing != null || item.post_spacing != null

  function toggleSpacing() {
    if (spacingOpen && hasCustomSpacing) onSpacingChange(undefined, undefined)
    setSpacingOpen(x => !x)
  }

  if (item.kind === 'full') {
    return (
      <div ref={setNodeRef} style={s} className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 group">
        <div className="flex items-center gap-2 px-2 py-2">
          <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none text-base leading-none px-0.5">⠿</button>
          <span className="flex-1 text-sm text-gray-800">{getLabel(item.id)}</span>
          <button onClick={toggleSpacing}
            className={`text-xs px-1 leading-none transition-colors ${hasCustomSpacing ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}
            title="Per-section spacing">↕</button>
          <label className="flex items-center gap-1 text-xs text-gray-400 select-none cursor-pointer">
            <input type="checkbox" checked={item.breakable} onChange={onToggleBreakable} className="w-3 h-3 accent-blue-500" />
            <span>break</span>
          </label>
          <button onClick={onRemove} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none">×</button>
        </div>
        {spacingOpen && (
          <SpacingRow pre={curPre} post={curPost}
            onChange={(pre, post) => onSpacingChange(pre, post)}
            onClear={() => { onSpacingChange(undefined, undefined); setSpacingOpen(false) }} />
        )}
      </div>
    )
  }
  return (
    <div ref={setNodeRef} style={s} className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 group">
      <div className="flex items-center gap-2 px-2 py-2">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none text-base leading-none px-0.5">⠿</button>
        <button onClick={() => setExpanded(x => !x)} className="flex-1 flex items-center gap-1.5 text-sm text-gray-700 text-left">
          <span className="text-gray-400 text-xs">{expanded ? '▾' : '▸'}</span>
          <span>{item.columns}-col group</span>
          <span className="text-xs text-gray-400 ml-1">({item.content.map(c => c.length).join('+')})</span>
        </button>
        <button onClick={toggleSpacing}
          className={`text-xs px-1 leading-none transition-colors ${hasCustomSpacing ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}
          title="Per-section spacing">↕</button>
        <label className="flex items-center gap-1 text-xs text-gray-400 select-none cursor-pointer">
          <input type="checkbox" checked={item.breakable} onChange={onToggleBreakable} className="w-3 h-3 accent-blue-500" />
          <span>break</span>
        </label>
        <button onClick={onRemove} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none">×</button>
      </div>
      {spacingOpen && (
        <SpacingRow pre={curPre} post={curPost}
          onChange={(pre, post) => onSpacingChange(pre, post)}
          onClear={() => { onSpacingChange(undefined, undefined); setSpacingOpen(false) }} />
      )}
      {expanded && (
        <div className="grid gap-2 px-2 pb-2 border-t border-gray-100 pt-2" style={{ gridTemplateColumns: `repeat(${item.columns}, 1fr)` }}>
          {item.content.map((col, ci) => (
            <ColumnSlot key={ci} label={`Col ${ci + 1}`} sections={col} available={available}
              onRemove={si => onUpdateColumn(ci, col.filter((_, j) => j !== si))}
              onAdd={id => onUpdateColumn(ci, [...col, id])} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Save modal ────────────────────────────────────────────────────────────────

function SaveModal({ onSave, onCancel }: {
  onSave: (name: string) => void; onCancel: () => void
}) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-5 w-72 mx-4">
        <p className="text-sm font-semibold text-gray-900 mb-1">Save configuration</p>
        <p className="text-xs text-gray-400 mb-3">Saves layout + style to browser storage</p>
        <input
          autoFocus
          type="text"
          placeholder="My dark sidebar"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 text-sm text-gray-600 border border-gray-200 py-1.5 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 text-sm bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Saved configs list ────────────────────────────────────────────────────────

function SavedList({ saves, templateId, onLoad, onDelete }: {
  saves: SavedConfig[]; templateId: string
  onLoad: (c: SavedConfig) => void; onDelete: (id: string) => void
}) {
  const mine = saves.filter(s => s.templateId === templateId)
  if (mine.length === 0) return <p className="text-xs text-gray-400 italic">No saved configurations yet</p>

  return (
    <div className="space-y-1.5">
      {mine.map(c => (
        <div key={c.id} className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg group hover:border-gray-300">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
            <p className="text-xs text-gray-400">{new Date(c.savedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
          </div>
          <button onClick={() => onLoad(c)} className="text-xs text-blue-600 hover:text-blue-800 px-1" title="Load">↩</button>
          <button
            onClick={() => downloadJson(
              { _name: c.name, _templateId: c.templateId, _savedAt: c.savedAt, ...c.layout as object, ...(Object.keys(c.style).length > 0 && { style: c.style }) },
              `${c.templateId}-${c.name.toLowerCase().replace(/\s+/g, '-')}.json`
            )}
            className="text-xs text-gray-400 hover:text-gray-700 px-1" title="Download"
          >↓</button>
          <button onClick={() => onDelete(c.id)} className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 px-1" title="Delete">×</button>
        </div>
      ))}
    </div>
  )
}

// ── Style param renderer (shared between grouped and ungrouped) ───────────────

function StyleParamField({ p, value, onChange }: {
  p: StyleParam
  value: string | number | undefined
  onChange: (key: string, value: string | number) => void
}) {
  if (p.type === 'color') {
    const v = (value as string) ?? p.default
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <div className="flex items-center gap-1.5">
          <input type="color" value={v} onChange={e => onChange(p.key, e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" />
          <span className="text-xs text-gray-400 font-mono w-16 text-right">{v}</span>
        </div>
      </div>
    )
  }
  if (p.type === 'select') {
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <select value={(value as string) ?? p.default} onChange={e => onChange(p.key, e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white max-w-36">
          {p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  if (p.type === 'toggle') {
    const checked = ((value as string) ?? p.default) === 'true'
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(p.key, checked ? 'false' : 'true')}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      </div>
    )
  }
  if (p.type === 'text') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">{p.label}</label>
        <input
          type="text"
          value={(value as string) ?? p.default}
          placeholder={p.placeholder ?? ''}
          onChange={e => onChange(p.key, e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white w-full"
        />
      </div>
    )
  }
  // range
  const v = (value as number) ?? p.default
  const decimals = p.step >= 1 ? 0 : p.step >= 0.1 ? 1 : 2
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{p.label}</label>
        <span className="text-xs text-gray-400 font-mono">{v.toFixed(decimals)}{p.unit}</span>
      </div>
      <input type="range" min={p.min} max={p.max} step={p.step} value={v}
        onChange={e => onChange(p.key, parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-1.5" />
      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
        <span>{p.min}{p.unit}</span><span>{p.max}{p.unit}</span>
      </div>
    </div>
  )
}

// ── Style group (collapsible sub-section inside the Style panel) ──────────────

function StyleGroup({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button onClick={() => setOpen(x => !x)}
        className="flex items-center justify-between w-full py-2 text-left hover:text-gray-700 transition-colors">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="space-y-3 pb-3">{children}</div>}
    </div>
  )
}

// ── Accordion section ─────────────────────────────────────────────────────────

function AccordionSection({ title, badge, isOpen, onToggle, children }: {
  title: string; badge?: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full leading-none">{badge}</span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  )
}

// ── Main editor ───────────────────────────────────────────────────────────────

type Panel = 'layout' | 'style' | 'saved'

export default function LayoutEditor({
  initialLayout, templateId, styleParams = [], sections = DEFAULT_SECTIONS, cvContent, generateTrigger = 0, onPdfChange, onGenerating,
}: {
  initialLayout: Record<string, unknown>; templateId: string
  styleParams?: StyleParam[]
  sections?: SectionDef[]
  cvContent: string
  generateTrigger?: number
  onPdfChange: (url: string) => void; onGenerating: (v: boolean) => void
}) {
  const [state, setState] = useState<EditorState>(() => parseLayout(initialLayout, styleParams, loadStyleOverrides()))
  type CompileState = 'idle' | 'loading' | 'compiling'
  const [compileState, setCompileState] = useState<CompileState>('idle')
  const [compilerReady, setCompilerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [activePanel, setActivePanel] = useState<Panel>('layout')
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

  const hasSidebar  = state.sidebarSections !== undefined
  const sidebarSet  = new Set(state.sidebarSections?.map(s => s.id) ?? [])
  const available   = allMainIds.filter(id => !usedIds(state.sections).has(id) && !sidebarSet.has(id))
  const availableSb = allSidebarIds.filter(id => !sidebarSet.has(id))
  const mySavesCount = saves.filter(s => s.templateId === templateId).length

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function updateSection(key: string, fn: (s: EditorSection) => EditorSection) {
    setState(prev => ({ ...prev, sections: prev.sections.map(s => s.key === key ? fn(s) : s) }))
  }
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setState(prev => {
      const from = prev.sections.findIndex(s => s.key === active.id)
      const to   = prev.sections.findIndex(s => s.key === over.id)
      return { ...prev, sections: arrayMove(prev.sections, from, to) }
    })
  }
  function handleSidebarDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setState(prev => {
      const sbs  = prev.sidebarSections!
      const from = sbs.findIndex(s => s.id === active.id)
      const to   = sbs.findIndex(s => s.id === over.id)
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
  function setStyleValue(key: string, value: string | number) {
    setState(prev => ({ ...prev, style: { ...prev.style, [key]: value } }))
    const param = styleParams.find(p => p.key === key)
    persistStyleOverride(param?.canonical ?? key, value)
  }
  function resetStyle() {
    const defaults: StyleValues = {}
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

  // ── Generate ─────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (compileState !== 'idle') return
    setError(null)
    const layoutData = serializeForTypst(state)

    // Determine QR SVG if the template requests it
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
    if (!isCompilerReady()) {
      onCompilerReady(() => setCompileState('compiling'))
    }
    try {
      const url = await compileTypst({
        templateId,
        cvContent,
        layoutJson: JSON.stringify(layoutData),
        qrSvg,
      })
      onPdfChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCompileState('idle')
      onGenerating(false)
    }
  }

  // Track when the WASM compiler finishes initializing (for button label)
  useEffect(() => {
    if (isCompilerReady()) { setCompilerReady(true); return }
    onCompilerReady(() => setCompilerReady(true))
  }, [])

  // Auto-generate when parent increments the trigger (e.g. after first CV save)
  useEffect(() => {
    if (generateTrigger > 0 && compileState === 'idle' && cvContent) handleGenerate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateTrigger])

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <LabelCtx.Provider value={getLabel}>
      {showSaveModal && <SaveModal onSave={handleSave} onCancel={() => setShowSaveModal(false)} />}

      <div className="flex flex-col h-full">

        {/* ── Accordion panels ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Panel 1: Layout */}
          <AccordionSection title="Layout" isOpen={activePanel === 'layout'} onToggle={() => setActivePanel('layout')}>
            {/* Sidebar sections OR header style toggle */}
            {hasSidebar ? (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400 mb-2">Name &amp; headline always shown</p>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sidebar</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSidebarDragEnd}>
                  <SortableContext items={state.sidebarSections!.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {state.sidebarSections!.map(s => (
                        <SortableSidebarChip key={s.id} item={s}
                          onRemove={() => removeSidebarSection(s.id)}
                          onToggleBreakable={() => toggleSidebarBreakable(s.id)}
                          onSpacingChange={(pre, post) => updateSidebarSpacing(s.id, pre, post)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {availableSb.length > 0 && (
                  <select className="mt-2 w-full text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 bg-white"
                    value="" onChange={e => { if (e.target.value) addSidebarSection(e.target.value) }}>
                    <option value="">+ add to sidebar</option>
                    {availableSb.map(id => <option key={id} value={id}>{getLabel(id)}</option>)}
                  </select>
                )}
                <p className="text-xs font-medium text-gray-500 mt-4 mb-1.5 uppercase tracking-wide">Main column</p>
              </div>
            ) : (
              <div className="px-4 pb-3">
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Header style</p>
                <div className="flex gap-1 mb-3">
                  {(['split', 'stacked'] as const).map(v => (
                    <button key={v} onClick={() => setState(prev => ({ ...prev, header: { style: v } }))}
                      className={`flex-1 text-xs py-1 rounded border transition-colors ${state.header.style === v ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sections</p>
              </div>
            )}

            {/* Main sections drag list */}
            <div className="px-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={state.sections.map(s => s.key)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {state.sections.map(item => (
                      <SortableCard key={item.key} item={item} available={available}
                        onToggleBreakable={() => updateSection(item.key, s => ({ ...s, breakable: !s.breakable }))}
                        onRemove={() => removeSection(item.key)}
                        onUpdateColumn={(ci, secs) => updateColumn(item.key, ci, secs)}
                        onSpacingChange={(pre, post) => updateSpacing(item.key, pre, post)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="flex gap-1.5 pt-2">
                {available.length > 0 && (
                  <select className="flex-1 text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 bg-white"
                    value="" onChange={e => { if (e.target.value) addFullSection(e.target.value) }}>
                    <option value="">+ add section</option>
                    {available.map(id => <option key={id} value={id}>{getLabel(id)}</option>)}
                  </select>
                )}
                <button onClick={addColumnsGroup} className="text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 whitespace-nowrap">
                  + columns
                </button>
              </div>
            </div>
          </AccordionSection>

          {/* Panel 2: Style (only when template has style params) */}
          {styleParams.length > 0 && (
            <AccordionSection title="Style" isOpen={activePanel === 'style'} onToggle={() => setActivePanel('style')}>
              <div className="px-4">
                {(() => {
                  // Split params into ungrouped + ordered named groups
                  const groupOrder: string[] = []
                  const groupMap = new Map<string, StyleParam[]>()
                  const ungrouped: StyleParam[] = []
                  for (const p of styleParams) {
                    if (!p.group) { ungrouped.push(p); continue }
                    if (!groupMap.has(p.group)) { groupOrder.push(p.group); groupMap.set(p.group, []) }
                    groupMap.get(p.group)!.push(p)
                  }
                  return (
                    <>
                      {ungrouped.length > 0 && (
                        <div className="space-y-3 pb-3">
                          {ungrouped.map(p => (
                            <StyleParamField key={p.key} p={p} value={state.style[p.key]} onChange={setStyleValue} />
                          ))}
                        </div>
                      )}
                      {groupOrder.map((g, i) => (
                        <StyleGroup key={g} title={g} defaultOpen={i === 0}>
                          {groupMap.get(g)!.map(p => (
                            <StyleParamField key={p.key} p={p} value={state.style[p.key]} onChange={setStyleValue} />
                          ))}
                        </StyleGroup>
                      ))}
                    </>
                  )
                })()}
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <button onClick={resetStyle} className="text-xs text-gray-400 hover:text-gray-600">
                    ↺ Reset to defaults
                  </button>
                </div>
              </div>
            </AccordionSection>
          )}

          {/* Panel 3: Saved */}
          <AccordionSection title="Saved" badge={mySavesCount} isOpen={activePanel === 'saved'} onToggle={() => setActivePanel('saved')}>
            <div className="px-4">
              <SavedList saves={saves} templateId={templateId} onLoad={handleLoad} onDelete={handleDelete} />
            </div>
          </AccordionSection>

        </div>

        {/* ── Actions (always pinned at bottom) ────────────────────── */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-2 shrink-0">
          {error && <p className="text-xs text-red-500 break-words">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save as…
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import ↑
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          <button onClick={handleGenerate} disabled={compileState !== 'idle'}
            className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {compileState === 'loading' ? 'Loading compiler…' : compileState === 'compiling' ? 'Compiling…' : 'Generate PDF'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {compileState === 'loading'
              ? 'Downloading compiler (~6 MB, once per session)'
              : compileState === 'compiling'
              ? 'Running Typst in your browser…'
              : compilerReady
              ? 'Runs entirely in your browser'
              : 'Compiled locally — your CV never leaves your device'}
          </p>
        </div>
      </div>
    </LabelCtx.Provider>
  )
}

function usedIds(sections: EditorSection[]): Set<string> {
  const used = new Set<string>()
  for (const s of sections) {
    if (s.kind === 'full') used.add(s.id)
    else for (const col of s.content) for (const id of col) used.add(id)
  }
  return used
}
