#!/usr/bin/env node
// Asserts that:
// 1. ALLOWED_TEMPLATES in typst-worker.ts matches .typ files on disk.
// 2. Every section ID in DEFAULT_SECTIONS has a corresponding branch in sections.typ / sidebar.typ.
// Run in CI to catch silent failures when templates or sections are added or removed.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ── 1. Template file list check ───────────────────────────────────────────────

const templateDir = path.join(root, 'src/typst/templates')
const workerPath  = path.join(root, 'src/lib/typst-worker.ts')

const onDisk = fs
  .readdirSync(templateDir)
  .filter((f) => f.endsWith('.typ'))
  .map((f) => f.replace('.typ', ''))
  .sort()

const workerSrc = fs.readFileSync(workerPath, 'utf8')
// Match template IDs inside ALLOWED_TEMPLATES = new Set([...])
const allowedMatch = workerSrc.match(/ALLOWED_TEMPLATES\s*=\s*new Set\(\[([^\]]+)\]\)/)
const inWorker = allowedMatch
  ? [...allowedMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()
  : []

const missingTemplates = onDisk.filter((t) => !inWorker.includes(t))
const staleTemplates   = inWorker.filter((t) => !onDisk.includes(t))

// ── 2. Section ID consistency check ──────────────────────────────────────────

const sectionDefsSrc = fs.readFileSync(
  path.join(root, 'src/app/templates/section-defs.ts'),
  'utf8',
)

// Extract { id, locations } pairs from DEFAULT_SECTIONS
const locationPattern = /\{\s*id:\s*'([^']+)'[^}]*locations:\s*\[([^\]]+)\]/g
const locationMap = new Map()
for (const m of sectionDefsSrc.matchAll(locationPattern)) {
  const id = m[1]
  const locs = []
  if (m[2].includes('main')) locs.push('main')
  if (m[2].includes('sidebar')) locs.push('sidebar')
  locationMap.set(id, locs)
}

const mainSectionsSrc    = fs.readFileSync(path.join(root, 'src/typst/sections.typ'), 'utf8')
const sidebarTemplateSrc = fs.readFileSync(
  path.join(root, 'src/typst/templates/sidebar.typ'),
  'utf8',
)

// Match both the leading `if id == "x"` and subsequent `else if id == "x"` branches
const inMainTyp = new Set(
  [...mainSectionsSrc.matchAll(/(?:else )?if id == "([^"]+)"/g)].map((m) => m[1]),
)
const inSidebarTyp = new Set(
  [...sidebarTemplateSrc.matchAll(/(?:else )?if sid == "([^"]+)"/g)].map((m) => m[1]),
)

const missingSectionErrors = []
for (const [id, locs] of locationMap) {
  if (locs.includes('main') && !inMainTyp.has(id)) {
    missingSectionErrors.push(`  sections.typ missing branch for "${id}" (main location)`)
  }
  if (locs.includes('sidebar') && !inSidebarTyp.has(id)) {
    missingSectionErrors.push(`  sidebar.typ missing branch for "${id}" (sidebar location)`)
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

let failed = false

if (missingTemplates.length === 0 && staleTemplates.length === 0) {
  console.log(`✔ ALLOWED_TEMPLATES in typst-worker.ts matches filesystem (${onDisk.length} templates)`)
} else {
  failed = true
  if (missingTemplates.length > 0) {
    console.error(`✘ Templates on disk but missing from ALLOWED_TEMPLATES: ${missingTemplates.join(', ')}`)
  }
  if (staleTemplates.length > 0) {
    console.error(`✘ Templates in ALLOWED_TEMPLATES but not on disk: ${staleTemplates.join(', ')}`)
  }
}

if (missingSectionErrors.length === 0) {
  console.log(`✔ All ${locationMap.size} section IDs have matching .typ branches`)
} else {
  failed = true
  console.error('✘ Section ID mismatches:')
  for (const err of missingSectionErrors) console.error(err)
}

process.exit(failed ? 1 : 0)
