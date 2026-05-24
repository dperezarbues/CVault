'use client'

import type { CvEntry } from './CvDataModal'
import type { Layout, Template } from './types'

type Props = {
  templates: Template[]
  activeTemplate: Template
  activeLayout: Layout
  cvList: CvEntry[]
  currentCv: CvEntry | null
  hydrated: boolean
  privateMode: boolean
  importRef: React.RefObject<HTMLInputElement | null>
  onSelectTemplate: (t: Template) => void
  onSelectLayout: (l: Layout) => void
  onNewCv: () => void
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectCv: (id: string) => void
  onEditCv: (entry: CvEntry) => void
  onDownloadCv: (entry: CvEntry) => void
  onDeleteCv: (id: string) => void
  onClearData: () => void
  onShowWelcome: () => void
}

export default function CvSidebar({
  templates,
  activeTemplate,
  activeLayout,
  cvList,
  currentCv,
  hydrated,
  privateMode,
  importRef,
  onSelectTemplate,
  onSelectLayout,
  onNewCv,
  onImportFile,
  onSelectCv,
  onEditCv,
  onDownloadCv,
  onDeleteCv,
  onClearData,
  onShowWelcome,
}: Props) {
  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-gray-100">
        <h1 className="text-sm font-semibold text-gray-900">CV Templates</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* CV section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">CV</p>
            <div className="flex items-center gap-1">
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportFile}
              />
              <button
                type="button"
                onClick={onNewCv}
                title="New CV"
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors px-1"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                title="Import JSON"
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors px-1"
              >
                ↑ Import
              </button>
            </div>
          </div>

          {hydrated && cvList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No CVs yet</p>
          ) : (
            <div className="space-y-1">
              {cvList.map((entry) => {
                const isCurrent = currentCv?.id === entry.id
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-1 rounded-lg group transition-colors ${
                      isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      type="button"
                      className="flex-1 flex items-center gap-1 px-2 py-1.5 text-left"
                      onClick={() => onSelectCv(entry.id)}
                    >
                      <span
                        className={`shrink-0 w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-blue-500' : 'bg-transparent'}`}
                      />
                      <span
                        className={`flex-1 text-xs truncate ${isCurrent ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        {entry.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditCv(entry)}
                      title="Edit"
                      className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none text-sm px-1 py-1.5"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadCv(entry)}
                      title="Download"
                      className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none text-sm px-1 py-1.5"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCv(entry.id)}
                      title="Delete"
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity leading-none text-sm px-1.5 py-1.5"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Template
          </p>
          <div className="space-y-1">
            {templates.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => onSelectTemplate(t)}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                  activeTemplate.id === t.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`text-sm font-medium ${activeTemplate.id === t.id ? 'text-blue-700' : 'text-gray-800'}`}
                >
                  {t.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 leading-snug">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {activeTemplate.layouts.length > 1 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Layout
            </p>
            <div className="space-y-1">
              {activeTemplate.layouts.map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => onSelectLayout(l)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors text-sm ${
                    activeLayout.id === l.id
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 space-y-2">
        {privateMode && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs text-amber-600 font-medium">Private session</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Home
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearData}
              title="Clear all stored data"
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              Clear data
            </button>
            <button
              type="button"
              onClick={onShowWelcome}
              title="Help"
              className="text-xs text-gray-400 hover:text-gray-600 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center leading-none"
            >
              ?
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
