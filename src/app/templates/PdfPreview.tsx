'use client'

import { useState } from 'react'
import { KEYS } from '@/lib/storage'
import type { CvEntry } from './CvDataModal'
import SupportPrompt from './components/SupportPrompt'

// Set NEXT_PUBLIC_SUPPORT_URL in .env.local to your GitHub Sponsors / Ko-fi / etc. link.
const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? ''

function getSupportPrompted(): boolean {
  try {
    return !!sessionStorage.getItem(KEYS.supportPrompted)
  } catch {
    return false
  }
}

function setSupportPrompted(): void {
  try {
    sessionStorage.setItem(KEYS.supportPrompted, '1')
  } catch {
    /* ignore */
  }
}

type Props = {
  templateName: string
  layoutName: string
  showLayoutSuffix: boolean
  currentPdf: string
  isSample: boolean
  isGenerating: boolean
  currentCv: CvEntry | null
  onReset: () => void
  onGenerate: () => void
  onNewCv: () => void
  onImport: () => void
}

export default function PdfPreview({
  templateName,
  layoutName,
  showLayoutSuffix,
  currentPdf,
  isSample,
  isGenerating,
  currentCv,
  onReset,
  onGenerate,
  onNewCv,
  onImport,
}: Props) {
  const [showSupport, setShowSupport] = useState(false)

  const downloadUrl = currentPdf.split('?')[0]

  function triggerDownload() {
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function handleSupportDismiss() {
    setSupportPrompted()
    setShowSupport(false)
  }

  function handleDownloadClick() {
    if (SUPPORT_URL && !getSupportPrompted()) {
      setShowSupport(true)
      return
    }
    triggerDownload()
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{templateName}</span>
          {showLayoutSuffix && (
            <>
              <span className="text-gray-300">·</span>
              <span>{layoutName}</span>
            </>
          )}
          {!isSample && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">preview</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isSample && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
          {!isSample && (
            <button
              type="button"
              onClick={handleDownloadClick}
              className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
            >
              Download
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <iframe
          key={currentPdf}
          src={currentPdf}
          className="w-full h-full border-0 bg-gray-100"
          title={`${templateName} preview`}
        />

        {isGenerating && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">Generating PDF…</p>
            <p className="text-xs text-gray-400">Running Typst compiler</p>
          </div>
        )}

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
                onClick={onGenerate}
                className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4"
              >
                Generate PDF
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={onNewCv}
                  className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  + New CV
                </button>
                <button
                  type="button"
                  onClick={onImport}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  ↑ Import
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showSupport && (
        <SupportPrompt
          supportUrl={SUPPORT_URL}
          downloadUrl={downloadUrl}
          onDismiss={handleSupportDismiss}
        />
      )}
    </div>
  )
}
