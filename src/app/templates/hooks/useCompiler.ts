'use client'

import QRCode from 'qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'
import { compileTypst, isCompilerReady, onCompilerReady } from '@/lib/typst-compile'
import { resolveQrUrl } from '../editor-utils'
import type { CompileState } from '../types'

const AUTO_GENERATE_DELAY_MS = 600

export function useCompiler({
  templateId,
  cvContent,
  getLayoutData,
  generateTrigger = 0,
  onPdfChange,
  onGenerating,
}: {
  templateId: string
  cvContent: string
  getLayoutData: () => object
  generateTrigger?: number
  onPdfChange: (url: string) => void
  onGenerating: (v: boolean) => void
}) {
  const [compileState, setCompileState] = useState<CompileState>('idle')
  const [compilerReady, setCompilerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs to always-current values so generate() is stable (no stale closures)
  const layoutRef = useRef(getLayoutData)
  const cvRef = useRef(cvContent)
  const onPdfRef = useRef(onPdfChange)
  const onGeneratingRef = useRef(onGenerating)
  const compileStateRef = useRef(compileState)

  useEffect(() => {
    layoutRef.current = getLayoutData
  }, [getLayoutData])
  useEffect(() => {
    cvRef.current = cvContent
  }, [cvContent])
  useEffect(() => {
    onPdfRef.current = onPdfChange
  }, [onPdfChange])
  useEffect(() => {
    onGeneratingRef.current = onGenerating
  }, [onGenerating])
  useEffect(() => {
    compileStateRef.current = compileState
  }, [compileState])

  const generate = useCallback(async () => {
    if (compileStateRef.current !== 'idle') return
    setError(null)

    const layoutData = layoutRef.current()
    const cv = cvRef.current

    let qrSvg: string | undefined
    const style = (layoutData as { style?: Record<string, unknown> }).style ?? {}
    if (style.show_qr === 'true') {
      const qrUrl = resolveQrUrl(cv, style)
      qrSvg = await QRCode.toString(qrUrl, { type: 'svg', margin: 0 })
    }

    setCompileState(isCompilerReady() ? 'compiling' : 'loading')
    onGeneratingRef.current(true)
    if (!isCompilerReady()) onCompilerReady(() => setCompileState('compiling'))

    try {
      const url = await compileTypst({
        templateId,
        cvContent: cv,
        layoutJson: JSON.stringify(layoutData),
        qrSvg,
      })
      onPdfRef.current(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCompileState('idle')
      onGeneratingRef.current(false)
    }
  }, [templateId]) // templateId is the only prop that isn't ref-stabilized

  useEffect(() => {
    if (isCompilerReady()) {
      setCompilerReady(true)
      return
    }
    onCompilerReady(() => setCompilerReady(true))
  }, [])

  // Auto-generate when parent signals via trigger (e.g. first CV save)
  useEffect(() => {
    const cv = cvRef.current
    if (generateTrigger > 0 && compileStateRef.current === 'idle' && cv) generate()
  }, [generateTrigger, generate])

  // Auto-generate on any layout, style, or CV content change (debounced)
  const isFirstRender = useRef(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: getLayoutData and cvContent are hook params that change reactively
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!cvRef.current) return
    const timer = setTimeout(() => generate(), AUTO_GENERATE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [getLayoutData, cvContent, generate])

  return { compileState, compilerReady, error, generate }
}
