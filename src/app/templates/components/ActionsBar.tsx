'use client'

import type { CompileState } from '../types'

type Props = {
  error: string | null
  compileState: CompileState
  compilerReady: boolean
  importRef: React.RefObject<HTMLInputElement | null>
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGenerate: () => void
  onShowSaveModal: () => void
}

export default function ActionsBar({
  error,
  compileState,
  compilerReady,
  importRef,
  onImport,
  onGenerate,
  onShowSaveModal,
}: Props) {
  return (
    <div className="px-4 py-3 border-t border-gray-100 space-y-2 shrink-0">
      {error && <p className="text-xs text-red-500 break-words">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onShowSaveModal}
          className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Save as…
        </button>
        <button
          type="button"
          onClick={() => importRef.current?.click()}
          className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Import ↑
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onImport}
          data-testid="layout-import-input"
        />
      </div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={compileState !== 'idle'}
        className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {compileState === 'loading'
          ? 'Loading compiler…'
          : compileState === 'compiling'
            ? 'Compiling…'
            : 'Generate PDF'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        {compileState === 'loading'
          ? 'Downloading compiler (~6 MB, once per session)'
          : compileState === 'compiling'
            ? 'Running Typst in your browser…'
            : compilerReady
              ? 'Runs entirely in your browser'
              : 'Compiled locally — your CV never leaves your device'}
      </p>
    </div>
  )
}
