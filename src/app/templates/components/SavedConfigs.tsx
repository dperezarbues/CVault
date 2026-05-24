'use client'

import { useState } from 'react'
import { downloadJson } from '../editor-utils'
import type { SavedConfig } from '../types'

export function SaveModal({
  onSave,
  onCancel,
}: {
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-5 w-72 mx-4">
        <p className="text-sm font-semibold text-gray-900 mb-1">Save configuration</p>
        <p className="text-xs text-gray-400 mb-3">Saves layout + style to browser storage</p>
        <input
          // biome-ignore lint/a11y/noAutofocus: modal dialog — autofocus name field is the expected UX
          autoFocus
          type="text"
          placeholder="My dark sidebar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) onSave(name.trim())
          }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 text-sm text-gray-600 border border-gray-200 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
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

export function SavedList({
  saves,
  templateId,
  onLoad,
  onDelete,
}: {
  saves: SavedConfig[]
  templateId: string
  onLoad: (c: SavedConfig) => void
  onDelete: (id: string) => void
}) {
  const mine = saves.filter((s) => s.templateId === templateId)
  if (mine.length === 0)
    return <p className="text-xs text-gray-400 italic">No saved configurations yet</p>

  return (
    <div className="space-y-1.5">
      {mine.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg group hover:border-gray-300"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
            <p className="text-xs text-gray-400">
              {new Date(c.savedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onLoad(c)}
            className="text-xs text-blue-600 hover:text-blue-800 px-1"
            title="Load"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() =>
              downloadJson(
                {
                  _name: c.name,
                  _templateId: c.templateId,
                  _savedAt: c.savedAt,
                  ...(c.layout as object),
                  ...(Object.keys(c.style).length > 0 && { style: c.style }),
                },
                `${c.templateId}-${c.name.toLowerCase().replace(/\s+/g, '-')}.json`,
              )
            }
            className="text-xs text-gray-400 hover:text-gray-700 px-1"
            title="Download"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 px-1"
            title="Delete"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
