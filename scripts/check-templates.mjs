#!/usr/bin/env node
// Asserts that the template list hardcoded in typst-worker.ts matches
// the .typ files actually present in src/typst/templates/.
// Run in CI to catch silent failures when templates are added or removed.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const templateDir = path.join(root, 'src/typst/templates')
const workerPath  = path.join(root, 'src/lib/typst-worker.ts')

const onDisk = fs
  .readdirSync(templateDir)
  .filter((f) => f.endsWith('.typ'))
  .map((f) => f.replace('.typ', ''))
  .sort()

const workerSrc = fs.readFileSync(workerPath, 'utf8')
// Match only string literals (no template expressions like ${templateId})
const inWorker = [...workerSrc.matchAll(/\/src\/typst\/templates\/([a-z][a-z0-9_-]*)\.typ/g)]
  .map((m) => m[1])
  .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
  .sort()

const missing  = onDisk.filter((t) => !inWorker.includes(t))
const stale    = inWorker.filter((t) => !onDisk.includes(t))

if (missing.length === 0 && stale.length === 0) {
  console.log(`✔ Template list in typst-worker.ts matches filesystem (${onDisk.length} templates)`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`✘ Templates on disk but missing from typst-worker.ts: ${missing.join(', ')}`)
}
if (stale.length > 0) {
  console.error(`✘ Templates in typst-worker.ts but not on disk: ${stale.join(', ')}`)
}
process.exit(1)
