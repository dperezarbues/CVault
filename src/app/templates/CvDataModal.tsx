'use client'

import { useState } from 'react'
import cvStarter from '@/data/cv.starter.json'
import { CvEditor } from './cv-editor/CvEditor'
import { cvFormToJson, initFormData, jsonToCvForm } from './cv-editor/serialise'
import type { CvFormData } from './cv-editor/types'
import { CvSchema } from './schemas'

export interface CvEntry {
  id: string
  name: string
  content: string // raw JSON string
  updatedAt: number
}

interface Props {
  entry?: CvEntry // undefined = new
  initialContent?: string // for import mode
  initialName?: string // suggested name for import
  onSave: (entry: CvEntry) => void
  onCancel: () => void
}

const CV_TEMPLATE = JSON.stringify(cvStarter, null, 2)

type Mode = 'editor' | 'json'

function getInitialState(content: string): { mode: Mode; formData: CvFormData } {
  const parsed = initFormData(content)
  if (parsed) return { mode: 'editor', formData: parsed }
  return {
    mode: 'json',
    formData: jsonToCvForm(JSON.parse(CV_TEMPLATE) as Record<string, unknown>),
  }
}

export default function CvDataModal({
  entry,
  initialContent,
  initialName,
  onSave,
  onCancel,
}: Props) {
  const defaultContent = entry?.content ?? initialContent ?? CV_TEMPLATE
  const defaultName = entry?.name ?? initialName ?? ''

  const initial = getInitialState(defaultContent)

  const [name, setName] = useState(defaultName)
  const [mode, setMode] = useState<Mode>(initial.mode)
  const [formData, setFormData] = useState<CvFormData>(initial.formData)
  const [jsonContent, setJsonContent] = useState(defaultContent)
  const [error, setError] = useState<string | null>(null)

  function switchToJson() {
    const json = cvFormToJson(formData)
    setJsonContent(JSON.stringify(json, null, 2))
    setMode('json')
    setError(null)
  }

  function switchToEditor() {
    try {
      const raw = JSON.parse(jsonContent) as Record<string, unknown>
      setFormData(jsonToCvForm(raw))
      setMode('editor')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  function handleFormat() {
    try {
      setJsonContent(JSON.stringify(JSON.parse(jsonContent), null, 2))
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

    let content: string
    if (mode === 'editor') {
      const json = cvFormToJson(formData)
      const result = CvSchema.safeParse(json)
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? 'Invalid CV structure')
        return
      }
      content = JSON.stringify(json)
    } else {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonContent)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid JSON')
        return
      }
      const result = CvSchema.safeParse(parsed)
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? 'Invalid CV structure')
        return
      }
      content = jsonContent
    }

    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      name: name.trim(),
      content,
      updatedAt: Date.now(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-2xl mx-4"
        style={{ height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">{entry ? 'Edit CV' : 'New CV'}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Name + mode tabs */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <label htmlFor="cv-name" className="text-xs font-medium text-gray-600 shrink-0">
            Name
          </label>
          <input
            id="cv-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My CV"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => mode === 'json' && switchToEditor()}
              className={`text-xs px-3 py-1.5 transition-colors ${mode === 'editor' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => mode === 'editor' && switchToJson()}
              className={`text-xs px-3 py-1.5 transition-colors ${mode === 'json' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {mode === 'editor' ? (
            <CvEditor data={formData} onChange={setFormData} />
          ) : (
            <div className="h-full flex flex-col px-5 py-3 gap-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFormat}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                >
                  Format
                </button>
              </div>
              <textarea
                value={jsonContent}
                onChange={(e) => {
                  setJsonContent(e.target.value)
                  setError(null)
                }}
                spellCheck={false}
                className="flex-1 font-mono text-xs border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 min-h-0"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && <p className="px-5 pb-1 text-xs text-red-500 shrink-0">{error}</p>}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
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
