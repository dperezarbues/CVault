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
import CvSidebar from './CvSidebar'
import OnboardingModal from './OnboardingModal'
import PdfPreview from './PdfPreview'
import type { SectionDef } from './section-defs'
import { DEFAULT_SECTIONS } from './section-defs'
import type { Layout, Template } from './types'

const LayoutEditor = dynamic(() => import('./LayoutEditor'), { ssr: false })

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

  const [cvList, setCvList] = useState<CvEntry[]>([])
  const [currentCvId, setCurrentCvId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [cvModal, setCvModal] = useState<CvModalState | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [privateMode, setPrivateMode] = useState(false)
  const [generateTrigger, setGenerateTrigger] = useState(0)
  const importRef = useRef<HTMLInputElement>(null)

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
      <CvSidebar
        templates={templates}
        activeTemplate={activeTemplate}
        activeLayout={activeLayout}
        cvList={cvList}
        currentCv={currentCv}
        hydrated={hydrated}
        privateMode={privateMode}
        importRef={importRef}
        onSelectTemplate={selectTemplate}
        onSelectLayout={selectLayout}
        onNewCv={() => setCvModal({ mode: 'new' })}
        onImportFile={handleImportFile}
        onSelectCv={saveCurrentCvId}
        onEditCv={(entry) => setCvModal({ mode: 'edit', entry })}
        onDownloadCv={handleDownloadCv}
        onDeleteCv={handleDeleteCv}
        onClearData={handleClearData}
        onShowWelcome={() => setShowWelcome(true)}
      />

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

      <PdfPreview
        templateName={activeTemplate.name}
        layoutName={activeLayout.name}
        showLayoutSuffix={activeTemplate.layouts.length > 1}
        currentPdf={currentPdf}
        isSample={isSample}
        isGenerating={isGenerating}
        currentCv={currentCv}
        onReset={() => setPreviewPdf(null)}
        onGenerate={() => setGenerateTrigger((t) => t + 1)}
        onNewCv={() => setCvModal({ mode: 'new' })}
        onImport={() => importRef.current?.click()}
      />

      {showWelcome && (
        <OnboardingModal
          privateMode={privateMode}
          onPrivateToggle={handlePrivateToggle}
          onDismiss={dismissWelcome}
        />
      )}

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
