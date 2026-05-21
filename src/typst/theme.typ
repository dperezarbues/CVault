// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  theme.typ — semantic aliases over tokens + colors + CV-specific settings  ║
// ║  Import this file in all other .typ files (re-exports everything)          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

#import "tokens.typ": *

// ── Colors ────────────────────────────────────────────────────────────────────
#let c-ink     = rgb("#111111")  // name, entry titles
#let c-body    = rgb("#333333")  // body text
#let c-muted   = rgb("#666666")  // metadata, company, period
#let c-light   = rgb("#999999")  // labels, pills, footnotes
#let c-rule    = rgb("#dddddd")  // dividers, pill borders
#let c-link    = rgb("#1a56db")  // hyperlinks
#let c-pill-bg = rgb("#fafafa")  // pill background

// ── Page & typography ─────────────────────────────────────────────────────────
#let font-family   = "New Computer Modern"
#let page-paper    = "a4"
#let page-margin-x = margin-lg
#let page-margin-y = margin-sm
#let par-leading   = sp-2xl
#let block-spacing = sp-lg

// ── Section headers ───────────────────────────────────────────────────────────
#let section-pre      = sp-xl
#let section-post     = sp-xs
#let section-tracking = tracking-lg
#let section-fill     = rgb("#444444")
#let rule-weight      = tracking-xs
#let rule-color       = rgb("#bbbbbb")

// ── Skills ────────────────────────────────────────────────────────────────────
#let skills-gutter         = margin-md
#let skills-label-tracking = tracking-sm
