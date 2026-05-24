'use client'

import { useState, useContext } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SpacingRow from './SpacingRow'
import ColumnSlot from './ColumnSlot'
import { LabelCtx, DEFAULT_PRE, DEFAULT_POST } from '../editor-utils'
import type { EditorSection } from '../types'

export default function SortableCard({ item, available, onToggleBreakable, onRemove, onUpdateColumn, onSpacingChange }: {
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
