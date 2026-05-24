'use client'

import { useState } from 'react'
import cvStarter from '@/data/cv.starter.json'

export interface CvEntry {
  id: string
  name: string
  content: string   // raw JSON string
  updatedAt: number
}

interface Props {
  entry?: CvEntry          // undefined = new
  initialContent?: string  // for import mode
  initialName?: string     // suggested name for import
  onSave: (entry: CvEntry) => void
  onCancel: () => void
}

const CV_TEMPLATE = JSON.stringify(cvStarter, null, 2)

export default function CvDataModal({ entry, initialContent, initialName, onSave, onCancel }: Props) {
  const defaultContent = entry?.content ?? initialContent ?? CV_TEMPLATE
  const defaultName = entry?.name ?? initialName ?? ''

  const [name, setName] = useState(defaultName)
  const [content, setContent] = useState(defaultContent)
  const [error, setError] = useState<string | null>(null)

  function handleFormat() {
    try {
      const parsed = JSON.parse(content)
      setContent(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    try {
      JSON.parse(content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      return
    }
    const saved: CvEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      name: name.trim(),
      content,
      updatedAt: Date.now(),
    }
    onSave(saved)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-2xl mx-4"
        style={{ height: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">
            {entry ? 'Edit CV' : 'New CV'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Name row */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <label className="text-xs font-medium text-gray-600 shrink-0">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My CV"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFormat}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Format
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 px-5 py-3 min-h-0">
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setError(null) }}
            spellCheck={false}
            className="w-full h-full font-mono text-xs border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
          />
        </div>

        {/* Error line */}
        {error && (
          <p className="px-5 pb-1 text-xs text-red-500 shrink-0">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
