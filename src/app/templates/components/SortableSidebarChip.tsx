'use client'

import { useContext } from 'react'
import { LabelCtx } from '../editor-utils'
import type { SidebarSection } from '../types'
import SectionCard from './SectionCard'

export default function SortableSidebarChip({
  item,
  onRemove,
  onToggleBreakable,
  onSpacingChange,
}: {
  item: SidebarSection
  onRemove: () => void
  onToggleBreakable: () => void
  onSpacingChange: (pre: number | undefined, post: number | undefined) => void
}) {
  const getLabel = useContext(LabelCtx)
  return (
    <SectionCard
      sortableId={item.id}
      label={<span className="flex-1 text-sm text-gray-800">{getLabel(item.id)}</span>}
      breakable={item.breakable}
      preSpacing={item.pre_spacing}
      postSpacing={item.post_spacing}
      onToggleBreakable={onToggleBreakable}
      onRemove={onRemove}
      onSpacingChange={onSpacingChange}
    />
  )
}
