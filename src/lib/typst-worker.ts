/// <reference lib="webworker" />

import initWasm, { TypstCompilerBuilder, type TypstCompiler } from '@myriaddreamin/typst-ts-web-compiler'

export type CompileRequest = {
  id: number
  templateId: string
  cvContent: string
  layoutJson: string
  qrSvg?: string
}

export type CompileResponse =
  | { id: number; ok: true;  pdf: ArrayBuffer }
  | { id: number; ok: false; error: string }

export type WorkerMessage = CompileResponse | { type: 'ready' }

// ── State ─────────────────────────────────────────────────────────────────────

let compiler: TypstCompiler | null = null
let initPromise: Promise<void> | null = null
const enc = new TextEncoder()

const FONT_FILES = [
  'NewCM10-Regular.otf',
  'NewCM10-Bold.otf',
  'NewCM10-Italic.otf',
  'NewCM10-BoldItalic.otf',
]

const TYP_FILES: Array<{ vPath: string; publicPath: string }> = [
  { vPath: '/src/typst/tokens.typ',               publicPath: '/typst/tokens.typ' },
  { vPath: '/src/typst/styles.typ',               publicPath: '/typst/styles.typ' },
  { vPath: '/src/typst/components.typ',           publicPath: '/typst/components.typ' },
  { vPath: '/src/typst/sections.typ',             publicPath: '/typst/sections.typ' },
  { vPath: '/src/typst/templates/default.typ',    publicPath: '/typst/templates/default.typ' },
  { vPath: '/src/typst/templates/modern.typ',     publicPath: '/typst/templates/modern.typ' },
  { vPath: '/src/typst/templates/minimal.typ',    publicPath: '/typst/templates/minimal.typ' },
  { vPath: '/src/typst/templates/sidebar.typ',    publicPath: '/typst/templates/sidebar.typ' },
]

const ICON_NAMES = ['email', 'phone', 'github', 'linkedin', 'location', 'web', 'medium', 'facebook']

// ── Init ──────────────────────────────────────────────────────────────────────

async function initCompiler(): Promise<void> {
  const origin = self.location.origin

  // Load WASM from public/wasm/ (explicit URL — avoids import.meta.url tricks)
  await initWasm(new URL('/wasm/typst-compiler.wasm', origin))

  const builder = new TypstCompilerBuilder()
  builder.set_dummy_access_model()

  // Load fonts
  for (const name of FONT_FILES) {
    const resp = await fetch(`${origin}/fonts/${name}`)
    if (!resp.ok) throw new Error(`Failed to load font ${name}: ${resp.status}`)
    await builder.add_raw_font(new Uint8Array(await resp.arrayBuffer()))
  }

  compiler = await builder.build()

  // Register all Typst source files
  for (const { vPath, publicPath } of TYP_FILES) {
    const resp = await fetch(`${origin}${publicPath}`)
    if (!resp.ok) throw new Error(`Failed to load ${publicPath}: ${resp.status}`)
    compiler.add_source(vPath, await resp.text())
  }

  // Shadow all icon SVGs (needed by contact-icon() in components.typ)
  for (const name of ICON_NAMES) {
    const resp = await fetch(`${origin}/typst/icons/${name}.svg`)
    if (resp.ok) {
      compiler.map_shadow(`/src/typst/icons/${name}.svg`, enc.encode(await resp.text()))
    }
  }

  // Ensure QR placeholder exists so templates that optionally render it don't error
  const emptySvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>'
  compiler.map_shadow('/public/qr-temp.svg', enc.encode(emptySvg))
}

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initCompiler().then(() => {
      self.postMessage({ type: 'ready' } satisfies WorkerMessage)
    })
  }
  return initPromise
}

// ── Message handler ───────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<CompileRequest>) => {
  const { id, templateId, cvContent, layoutJson, qrSvg } = e.data

  try {
    await ensureInit()
    const c = compiler!

    // Shadow per-compile dynamic files (overwrites previous values)
    c.map_shadow('/runtime/cv.json', enc.encode(cvContent))
    c.map_shadow('/src/layouts/editor.json', enc.encode(layoutJson))
    if (qrSvg) {
      c.map_shadow('/public/qr-temp.svg', enc.encode(qrSvg))
    }

    const inputs: [string, string][] = [
      ['cv_file',  '/runtime/cv.json'],
      ['layout',   'editor'],
    ]

    const result = c.compile(`/src/typst/templates/${templateId}.typ`, inputs, 'pdf', 0)

    // result is either a Uint8Array directly or an object with a .result field
    let pdfBytes: Uint8Array
    if (result instanceof Uint8Array) {
      pdfBytes = result
    } else if (result && result.result instanceof Uint8Array) {
      pdfBytes = result.result
    } else {
      throw new Error('Unexpected compiler output — no PDF bytes returned')
    }

    // Transfer the buffer to avoid copying
    const buf = pdfBytes.buffer as ArrayBuffer
    const response: CompileResponse = { id, ok: true, pdf: buf }
    self.postMessage(response, [buf])
  } catch (err) {
    const response: CompileResponse = { id, ok: false, error: String(err) }
    self.postMessage(response)
  }
}
