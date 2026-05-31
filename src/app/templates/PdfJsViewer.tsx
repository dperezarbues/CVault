'use client'

import { useEffect, useRef, useState } from 'react'

type RenderState = 'idle' | 'loading' | 'ready' | 'error'

export default function PdfJsViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderState, setRenderState] = useState<RenderState>('idle')
  const [renderError, setRenderError] = useState<string>('')
  const renderGenRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !src) return
    const gen = ++renderGenRef.current
    setRenderState('loading')
    const abort = new AbortController()

    ;(async () => {
      try {
        // Fetch PDF bytes in the main thread so the worker never needs to
        // access the blob URL cross-thread (avoids opaque-origin restrictions).
        const resp = await fetch(src, { signal: abort.signal })
        if (!resp.ok) throw new Error(`fetch ${resp.status}`)
        const data = await resp.arrayBuffer()

        if (renderGenRef.current !== gen) return

        const pdfjs = await import('pdfjs-dist')
        if (renderGenRef.current !== gen) return

        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const pdf = await pdfjs.getDocument({ data }).promise
        if (renderGenRef.current !== gen) return

        const containerWidth = container.clientWidth || 600
        const dpr = window.devicePixelRatio || 1
        const canvases: HTMLCanvasElement[] = []

        for (let i = 1; i <= pdf.numPages; i++) {
          if (renderGenRef.current !== gen) return
          const page = await pdf.getPage(i)
          const baseViewport = page.getViewport({ scale: 1 })
          const cssScale = containerWidth / baseViewport.width
          const renderScale = cssScale * dpr
          const viewport = page.getViewport({ scale: renderScale })

          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.style.width = '100%'
          canvas.style.display = 'block'
          if (i > 1) canvas.style.marginTop = '8px'

          const ctx = canvas.getContext('2d')!
          await page.render({ canvasContext: ctx, viewport }).promise
          if (renderGenRef.current !== gen) return
          canvases.push(canvas)
        }

        if (renderGenRef.current !== gen) return
        container.replaceChildren(...canvases)
        setRenderState('ready')
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        if (renderGenRef.current === gen) {
          const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          setRenderError(msg)
          setRenderState('error')
        }
      }
    })()

    return () => {
      abort.abort()
    }
  }, [src])

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden relative"
      style={{ background: 'var(--c-paper-deep)' }}
      data-testid="pdfjs-viewer"
      data-pdf-src={src}
    >
      {/* Imperatively managed canvas mount point — React never renders children here */}
      <div ref={containerRef} />

      {renderState === 'loading' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'var(--c-paper-deep)' }}
        >
          <div
            className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--c-accent)', borderTopColor: 'transparent' }}
          />
        </div>
      )}
      {renderState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--c-sub)' }}>
            {renderError || 'Failed to render PDF'}
          </p>
        </div>
      )}
    </div>
  )
}
