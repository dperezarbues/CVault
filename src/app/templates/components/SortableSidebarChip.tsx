'use client'

import { useState, useContext } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SpacingRow from './SpacingRow'
import { LabelCtx, DEFAULT_PRE, DEFAULT_POST } from '../editor-utils'
import type { SidebarSection } from '../types'

export default function SortableSidebarChip({ item, onRemove, onToggleBreakable, onSpacingChange }: {
  item: SidebarSection; onRemove: () => void; onToggleBreakable: () => void
  onSpacingChange: (pre: number | undefined, post: number | undefined) => void
}) {
  const getLabel = useContext(LabelCtx)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [spacingOpen, setSpacingOpen] = useState(item.pre_spacing != null || item.post_spacing != null)
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
