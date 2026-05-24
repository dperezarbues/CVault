'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { DEFAULT_POST, DEFAULT_PRE } from '../editor-utils'
import SpacingRow from './SpacingRow'

type Props = {
  sortableId: string
  label: React.ReactNode
  breakable: boolean
  preSpacing: number | undefined
  postSpacing: number | undefined
  onToggleBreakable: () => void
  onRemove: () => void
  onSpacingChange: (pre: number | undefined, post: number | undefined) => void
  children?: React.ReactNode
}

export default function SectionCard({
  sortableId,
  label,
  breakable,
  preSpacing,
  postSpacing,
  onToggleBreakable,
  onRemove,
  onSpacingChange,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  })
  const [spacingOpen, setSpacingOpen] = useState(preSpacing != null || postSpacing != null)

  const hasCustomSpacing = preSpacing != null || postSpacing != null
  const curPre = preSpacing ?? DEFAULT_PRE
  const curPost = postSpacing ?? DEFAULT_POST

  function toggleSpacing() {
    if (spacingOpen && hasCustomSpacing) onSpacingChange(undefined, undefined)
    setSpacingOpen((x) => !x)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 group"
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none text-base leading-none px-0.5"
        >
          ⠿
        </button>
        {label}
        <button
          type="button"
          onClick={toggleSpacing}
          className={`text-xs px-1 leading-none transition-colors ${hasCustomSpacing ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}
          title="Per-section spacing"
        >
          ↕
        </button>
        <label className="flex items-center gap-1 text-xs text-gray-400 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={breakable}
            onChange={onToggleBreakable}
            className="w-3 h-3 accent-blue-500"
          />
          <span>break</span>
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none"
        >
          ×
        </button>
      </div>
      {spacingOpen && (
        <SpacingRow
          pre={curPre}
          post={curPost}
          onChange={(pre, post) => onSpacingChange(pre, post)}
          onClear={() => {
            onSpacingChange(undefined, undefined)
            setSpacingOpen(false)
          }}
        />
      )}
      {children}
    </div>
  )
}
