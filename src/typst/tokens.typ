// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  tokens.typ — root knobs and all derived scales                            ║
// ║  Import this anywhere you need raw scale values without semantic names     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ── Root knobs (4 values control everything) ──────────────────────────────────
#let fs-base       = 8pt      // base font size
#let sp-unit       = 0.5em    // base spacing unit
#let margin-base   = 1.1cm    // base page margin
#let tracking-base = 1pt      // base letter-spacing

// ── Font scale (2xs → 2xl) ───────────────────────────────────────────────────
#let fs-2xs = fs-base * 0.81   // ~6.5pt  pills, skill-group labels
#let fs-xs  = fs-base * 0.94   // ~7.5pt  section headers, status, cert footnotes
#let fs-sm  = fs-base           //  8pt    metadata, contact, cert names
#let fs-md  = fs-base * 1.06   // ~8.5pt  body text, bullets, descriptions
#let fs-lg  = fs-base * 1.19   // ~9.5pt  entry titles (job, education, project)
#let fs-xl  = fs-base * 1.25   //  10pt   document headline
#let fs-2xl = fs-base * 2.13   // ~17pt   document name

// ── Spacing scale (2xs → 2xl) ────────────────────────────────────────────────
#let sp-2xs = sp-unit * 0.20   // ~0.10em  between tight items (bullets)
#let sp-xs  = sp-unit * 0.40   // ~0.20em  section-post, minor internal gaps
#let sp-sm  = sp-unit * 0.50   // ~0.25em  within an entry (title→meta)
#let sp-md  = sp-unit * 0.70   // ~0.35em  between minor entries (awards, certs)
#let sp-lg  = sp-unit * 0.90   // ~0.45em  block spacing, section leading
#let sp-xl  = sp-unit * 1.00   //  0.50em  between major entries (jobs, projects)
#let sp-2xl = sp-unit * 1.40   // ~0.70em  paragraph line leading

// ── Tracking scale (xs → lg) ─────────────────────────────────────────────────
#let tracking-xs = tracking-base * 0.6   // ~0.6pt  rule stroke weight
#let tracking-sm = tracking-base * 0.8   // ~0.8pt  skill-group labels
#let tracking-lg = tracking-base * 1.5   // ~1.5pt  section header titles

// ── Margin scale (2xs → lg) ──────────────────────────────────────────────────
#let margin-2xs = margin-base * 0.45    // ~0.5cm
#let margin-xs  = margin-base * 0.73    // ~0.8cm
#let margin-sm  = margin-base            //  1.1cm  vertical page margin
#let margin-md  = margin-base * 1.09    // ~1.2cm
#let margin-lg  = margin-base * 1.27    // ~1.4cm  horizontal page margin

// ── Column gutters (one per column count) ────────────────────────────────────
#let col-gutter-2 = margin-md    // ~1.2cm — comfortable for 2 columns
#let col-gutter-3 = margin-xs    // ~0.8cm — tighter for 3 columns
#let col-gutter-4 = margin-2xs   // ~0.5cm — compact for 4 columns
#let col-gutter   = col-gutter-2 // default

// ── Pill ─────────────────────────────────────────────────────────────────────
#let pill-inset-x = tracking-base * 3.5   // 3.5pt — horizontal padding
#let pill-inset-y = tracking-base * 1.5   // 1.5pt — vertical padding
#let pill-radius  = tracking-base * 99    // 99pt  — fully rounded
#let pill-gap     = tracking-base * 2     // 2pt   — gap after each pill

// ── Inline micro-gaps (absolute pt, for horizontal spacing) ──────────────────
#let gap-xs = tracking-base * 4    // 4pt  — between inline elements (name · status)
#let gap-sm = tracking-base * 5    // 5pt  — separator character padding
#let gap-lg = tracking-base * 10   // 10pt — after language items
