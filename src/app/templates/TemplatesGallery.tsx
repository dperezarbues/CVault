'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  clearAllData,
  disablePrivateMode,
  enablePrivateMode,
  getItem,
  isPrivateMode,
  KEYS,
  removeItem,
  setItem,
} from '@/lib/storage'
import CvDataModal, { type CvEntry } from './CvDataModal'
import type { StyleParam } from './LayoutEditor'
import type { SectionDef } from './section-defs'
import { DEFAULT_SECTIONS } from './section-defs'

const LayoutEditor = dynamic(() => import('./LayoutEditor'), { ssr: false })
type Layout = { id: string; name: string; description: string; pdf?: string }
type Template = {
  id: string
  name: string
  description: string
  layouts: Layout[]
  styleParams?: StyleParam[]
}

type CvModalState =
  | { mode: 'new' }
  | { mode: 'import'; content: string; name: string }
  | { mode: 'edit'; entry: CvEntry }

export default function TemplatesGallery({
  templates,
  layoutData,
}: {
  templates: Template[]
  layoutData: Record<string, Record<string, Record<string, unknown>>>
}) {
  const [activeTemplate, setActiveTemplate] = useState<Template>(templates[0])
  const [activeLayout, setActiveLayout] = useState<Layout>(templates[0].layouts[0])
  const [previewPdf, setPreviewPdf] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // localStorage CV management
  const [cvList, setCvList] = useState<CvEntry[]>([])
  const [currentCvId, setCurrentCvId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [cvModal, setCvModal] = useState<CvModalState | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [privateMode, setPrivateMode] = useState(false)
  const [generateTrigger, setGenerateTrigger] = useState(0)
  const importRef = useRef<HTMLInputElement>(null)

  // Hydrate from storage on mount
  useEffect(() => {
    setPrivateMode(isPrivateMode())
    try {
      const stored = getItem(KEYS.cvs)
      if (stored) setCvList(JSON.parse(stored) as CvEntry[])
    } catch {
      /* ignore */
    }
    try {
      const stored = getItem(KEYS.currentCv)
      if (stored) setCurrentCvId(stored)
    } catch {
      /* ignore */
    }
    if (!getItem(KEYS.onboarded)) setShowWelcome(true)
    setHydrated(true)
  }, [])

  function dismissWelcome() {
    setItem(KEYS.onboarded, '1')
    setShowWelcome(false)
  }

  const currentCv = useMemo(
    () => cvList.find((c) => c.id === currentCvId) ?? cvList[0] ?? null,
    [cvList, currentCvId],
  )

  const activeSections: SectionDef[] = useMemo(() => {
    if (!currentCv) return DEFAULT_SECTIONS
    try {
      const parsed = JSON.parse(currentCv.content) as { _sections?: SectionDef[] }
      return parsed._sections ?? DEFAULT_SECTIONS
    } catch {
      return DEFAULT_SECTIONS
    }
  }, [currentCv])

  const samplePdf = `/samples/${activeTemplate.id}.pdf`
  const isSample = previewPdf === null
  const currentPdf = previewPdf ?? samplePdf
  const activeLayoutData = layoutData[activeTemplate.id]?.[activeLayout.id] ?? null
  const isEditable = activeLayoutData !== null

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function saveCvList(list: CvEntry[]) {
    setCvList(list)
    setItem(KEYS.cvs, JSON.stringify(list))
  }

  function saveCurrentCvId(id: string) {
    setCurrentCvId(id)
    setItem(KEYS.currentCv, id)
  }

  function handleSaveCv(entry: CvEntry) {
    const idx = cvList.findIndex((c) => c.id === entry.id)
    const isNew = idx < 0
    const updated = isNew ? [...cvList, entry] : cvList.map((c) => (c.id === entry.id ? entry : c))
    saveCvList(updated)
    saveCurrentCvId(entry.id)
    setCvModal(null)
    if (isNew && cvList.length === 0) setGenerateTrigger((t) => t + 1)
  }

  function handleDeleteCv(id: string) {
    const updated = cvList.filter((c) => c.id !== id)
    saveCvList(updated)
    if (currentCvId === id) {
      const next = updated[0] ?? null
      if (next) saveCurrentCvId(next.id)
      else {
        setCurrentCvId(null)
        removeItem(KEYS.currentCv)
      }
    }
  }

  function handleDownloadCv(entry: CvEntry) {
    const blob = new Blob([entry.content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entry.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handlePrivateToggle(enabled: boolean) {
    if (enabled) enablePrivateMode()
    else disablePrivateMode()
    // Re-persist current in-memory state into the newly active store
    if (cvList.length > 0) setItem(KEYS.cvs, JSON.stringify(cvList))
    if (currentCvId) setItem(KEYS.currentCv, currentCvId)
    setPrivateMode(enabled)
  }

  function handleClearData() {
    if (!confirm('Delete all CV data stored in this browser? This cannot be undone.')) return
    clearAllData()
    setCvList([])
    setCurrentCvId(null)
    setPreviewPdf(null)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      const name = file.name.replace(/\.json$/i, '')
      setCvModal({ mode: 'import', content, name })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function selectTemplate(t: Template) {
    setActiveTemplate(t)
    setActiveLayout(t.layouts[0])
    setPreviewPdf(null)
  }

  function selectLayout(l: Layout) {
    setActiveLayout(l)
    setPreviewPdf(null)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Col 1: Template + layout picker ──────────────────────────── */}
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
                  onChange={handleImportFile}
                />
                <button
                  type="button"
                  onClick={() => setCvModal({ mode: 'new' })}
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
                        onClick={() => saveCurrentCvId(entry.id)}
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
                        onClick={() => setCvModal({ mode: 'edit', entry })}
                        title="Edit"
                        className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none text-sm px-1 py-1.5"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(entry)}
                        title="Download"
                        className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none text-sm px-1 py-1.5"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCv(entry.id)}
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
                  onClick={() => selectTemplate(t)}
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
                    onClick={() => selectLayout(l)}
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
                onClick={handleClearData}
                title="Clear all stored data"
                className="text-xs text-gray-300 hover:text-red-400 transition-colors"
              >
                Clear data
              </button>
              <button
                type="button"
                onClick={() => setShowWelcome(true)}
                title="Help"
                className="text-xs text-gray-400 hover:text-gray-600 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center leading-none"
              >
                ?
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Col 2: Layout editor (only for editable templates) ────────── */}
      {isEditable && activeLayoutData && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Layout editor</p>
            <p className="text-xs text-gray-400 mt-0.5">Drag to reorder · toggle page breaks</p>
          </div>
          <LayoutEditor
            key={`${activeTemplate.id}-${activeLayout.id}`}
            initialLayout={activeLayoutData}
            templateId={activeTemplate.id}
            styleParams={activeTemplate.styleParams ?? []}
            sections={activeSections}
            cvContent={currentCv?.content ?? ''}
            generateTrigger={generateTrigger}
            onPdfChange={(url) =>
              setPreviewPdf((prev) => {
                if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
                return url
              })
            }
            onGenerating={setIsGenerating}
          />
        </div>
      )}

      {/* ── Col 3: PDF preview ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activeTemplate.name}</span>
            {activeTemplate.layouts.length > 1 && (
              <>
                <span className="text-gray-300">·</span>
                <span>{activeLayout.name}</span>
              </>
            )}
            {previewPdf && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                preview
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {previewPdf && (
              <button
                type="button"
                onClick={() => setPreviewPdf(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Reset
              </button>
            )}
            {!isSample && (
              <a
                href={currentPdf.split('?')[0]}
                download
                className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
              >
                Download
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 relative min-h-0">
          <iframe
            key={currentPdf}
            src={currentPdf}
            className="w-full h-full border-0 bg-gray-100"
            title={`${activeTemplate.name} preview`}
          />

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Generating PDF…</p>
              <p className="text-xs text-gray-400">Running Typst compiler</p>
            </div>
          )}

          {/* Sample data banner — shown when no real PDF has been generated yet */}
          {!isGenerating && isSample && (
            <div className="absolute bottom-0 inset-x-0 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded font-medium">
                  Sample
                </span>
                <p className="text-xs text-gray-300">
                  {currentCv
                    ? 'Hit Generate PDF to preview your CV'
                    : 'Add your CV to generate your own PDF'}
                </p>
              </div>
              {currentCv ? (
                <button
                  type="button"
                  onClick={() => setGenerateTrigger((t) => t + 1)}
                  className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4"
                >
                  Generate PDF
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => setCvModal({ mode: 'new' })}
                    className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    + New CV
                  </button>
                  <button
                    type="button"
                    onClick={() => importRef.current?.click()}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ↑ Import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Welcome / help modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome to CVault</h2>
              <p className="text-sm text-gray-500 mb-6">
                A privacy-first CV editor. Your data is stored in this browser — nothing is saved
                server-side.
              </p>

              <div className="space-y-4">
                {(
                  [
                    {
                      step: '1',
                      title: 'Add your CV',
                      body: 'Use "+ New" to create a CV from the template, or "↑ Import" to load an existing JSON file. You can have multiple CVs and switch between them.',
                    },
                    {
                      step: '2',
                      title: 'Pick a template & customise',
                      body: 'Select a template from the list. The middle panel lets you reorder sections, toggle page breaks, and adjust colors, fonts, and spacing.',
                    },
                    {
                      step: '3',
                      title: 'Generate your PDF',
                      body: 'Hit "Generate PDF" in the editor panel. Your CV is compiled with Typst and the PDF appears in the preview. Download whenever you\'re happy.',
                    },
                  ] as const
                ).map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{s.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  id="private-mode-toggle"
                  checked={privateMode}
                  onChange={(e) => handlePrivateToggle(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <label
                  htmlFor="private-mode-toggle"
                  className="text-xs text-gray-600 leading-relaxed cursor-pointer"
                >
                  <span className="font-semibold text-gray-800">I&apos;m on a shared computer</span>
                  <br />
                  Data will be stored in session storage and cleared automatically when this tab
                  closes.
                </label>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">You can reopen this via the ? button.</p>
              <button
                type="button"
                onClick={dismissWelcome}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors font-medium"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV Data Modal */}
      {cvModal && (
        <CvDataModal
          entry={cvModal.mode === 'edit' ? cvModal.entry : undefined}
          initialContent={cvModal.mode === 'import' ? cvModal.content : undefined}
          initialName={cvModal.mode === 'import' ? cvModal.name : undefined}
          onSave={handleSaveCv}
          onCancel={() => setCvModal(null)}
        />
      )}
    </div>
  )
}
