#import "theme.typ": *

// ── Section divider ───────────────────────────────────────────────────────────
#let cv-section(title) = {
  v(section-pre)
  text(size: fs-label, weight: "bold", tracking: section-tracking, fill: section-fill, upper(title))
  v(sp-xs - 0.5pt, weak: true)
  line(length: 100%, stroke: rule-weight + rule-color)
  v(section-post)
}

// ── Stack / skill pill ────────────────────────────────────────────────────────
#let pill(t) = box(
  inset: (x: 3.5pt, y: 1.5pt),
  radius: 99pt,
  stroke: 0.4pt + c-rule,
  fill: rgb("#fafafa"),
  text(size: fs-micro, fill: c-light, t),
)

// ── Inline separator (·) ──────────────────────────────────────────────────────
#let sep = [#h(5pt)#text(fill: c-rule)[·]#h(5pt)]
