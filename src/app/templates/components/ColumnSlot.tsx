'use client'

import { useContext } from 'react'
import { LabelCtx } from '../editor-utils'

export default function ColumnSlot({ label, sections, available, onRemove, onAdd }: {
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
