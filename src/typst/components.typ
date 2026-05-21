#import "theme.typ": *

// ── Section divider ───────────────────────────────────────────────────────────
#let cv-section(title) = {
  v(section-pre)
  text(size: fs-xs, weight: "bold", tracking: section-tracking, fill: section-fill, upper(title))
  v(sp-sm, weak: true)
  line(length: 100%, stroke: rule-weight + rule-color)
  v(section-post)
}

// ── Stack / skill pill ────────────────────────────────────────────────────────
#let pill(t) = box(
  inset: (x: pill-inset-x, y: pill-inset-y),
  radius: pill-radius,
  stroke: tracking-xs + c-rule,
  fill: c-pill-bg,
  text(size: fs-2xs, fill: c-light, t),
)

// ── Inline separator (·) ──────────────────────────────────────────────────────
#let sep = [#h(gap-sm)#text(fill: c-rule)[·]#h(gap-sm)]
