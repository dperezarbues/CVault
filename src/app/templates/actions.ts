'use server'

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import QRCode from 'qrcode'
import { DEFAULT_SECTIONS, type SectionDef } from './section-defs'

const DEBUG = process.env.CV_DEBUG === '1'

function log(...args: unknown[]) {
  if (DEBUG) console.log('[CVault]', ...args)
}

function isValidCvFilename(f: string): boolean {
  return /^[\w-]+\.json$/.test(f) && f !== 'templates.json'
}

export async function getCvFiles(): Promise<string[]> {
  const dataDir = path.join(process.cwd(), 'src', 'data')
  return fs.readdirSync(dataDir)
    .filter(isValidCvFilename)
    .sort()
}

export async function getCvSectionsFromFile(filename: string): Promise<SectionDef[]> {
  if (!isValidCvFilename(filename)) return DEFAULT_SECTIONS
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', filename)
    const cv = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { _sections?: SectionDef[] }
    return cv._sections ?? DEFAULT_SECTIONS
  } catch {
    return DEFAULT_SECTIONS
  }
}

async function generateQr(url: string): Promise<void> {
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0 })
  const outPath = path.join(process.cwd(), 'public', 'qr-temp.svg')
  fs.writeFileSync(outPath, svg)
  log(`QR generated for ${url} → ${outPath}`)
}

export async function generateEditorPdf(
  layoutData: object,
  templateId: string,
  cvContent: string,
): Promise<{ success: true; pdf: string } | { success: false; error: string }> {
  const tempFilename = `_tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.json`
  const tempFilePath = path.join(process.cwd(), 'src', 'data', tempFilename)
  try {
    const layoutsDir = path.join(process.cwd(), 'src', 'layouts')
    const layoutPath = path.join(layoutsDir, 'editor.json')

    log(`Writing editor layout to ${layoutPath}`)
    fs.writeFileSync(layoutPath, JSON.stringify(layoutData, null, 2))

    // Write CV content to temp file
    fs.writeFileSync(tempFilePath, cvContent, 'utf-8')

    // Extract feature flags from style
    const style = (layoutData as { style?: Record<string, unknown> }).style ?? {}
    const showQr             = style.show_qr              === 'true' || style.show_qr              === true
    const showFooter         = style.show_footer          === 'true' || style.show_footer          === true
    const showContactIcons   = style.show_contact_icons   === 'true' || style.show_contact_icons   === true
    const showContactLabels  = style.show_contact_labels  === 'true' || style.show_contact_labels  === true

    // Generate QR SVG if needed
    if (showQr) {
      let qrUrl = String(style.qr_url ?? '').trim()
      if (!qrUrl) {
        // fall back to linkedin from the contact array (new schema) or identity.linkedin (old schema)
        try {
          const cv = JSON.parse(cvContent) as { identity?: { contact?: Array<{type: string; value: string}>; linkedin?: string } }
          const contact = cv.identity?.contact ?? []
          const linkedinEntry = contact.find(e => e.type === 'linkedin')
          const linkedinValue = linkedinEntry?.value ?? cv.identity?.linkedin ?? ''
          qrUrl = linkedinValue
            ? (linkedinValue.startsWith('http') ? linkedinValue : `https://${linkedinValue}`)
            : 'https://linkedin.com'
        } catch {
          qrUrl = 'https://linkedin.com'
        }
      }
      await generateQr(qrUrl)
    }

    const cmd = `bash scripts/generate-pdf.sh ${templateId} editor /src/data/${tempFilename}`
    log(`Running: ${cmd}`)
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ...(showFooter        && { CV_SHOW_FOOTER:          'true' }),
      ...(showQr            && { CV_SHOW_QR:              'true' }),
      ...(showContactIcons  && { CV_SHOW_CONTACT_ICONS:   'true' }),
      ...(showContactLabels && { CV_SHOW_CONTACT_LABELS:  'true' }),
    }
    const out = execSync(cmd, { cwd: process.cwd(), timeout: 30_000, env }).toString()
    log(out.trim())

    const filename = templateId === 'default' ? 'cv-editor.pdf' : `cv-${templateId}-editor.pdf`
    log(`Done → /${filename}`)
    return { success: true, pdf: `/${filename}?t=${Date.now()}` }
  } catch (err) {
    const msg = err instanceof Error
      ? `${err.message}\n${(err as NodeJS.ErrnoException).code ?? ''}`
      : String(err)
    console.error('[CVault] generateEditorPdf failed:', msg)
    return { success: false, error: msg }
  } finally {
    try { fs.unlinkSync(tempFilePath) } catch { /* ignore if already deleted */ }
  }
}
