#import "theme.typ": *
#import "components.typ": *
#import "sections.typ": *

// ── Data ─────────────────────────────────────────────────────────────────────
#let data = json("/src/data/cv.json")
#let id   = data.identity

// ── Page & typography ────────────────────────────────────────────────────────
#set page(paper: page-paper, margin: (x: page-margin-x, y: page-margin-y))
#set text(font: font-family, size: fs-meta, fill: c-body, lang: "en")
#set par(justify: true, leading: par-leading)
#set block(above: block-spacing, below: block-spacing)
#show link: set text(fill: c-link)

// ── Header ───────────────────────────────────────────────────────────────────
#text(size: fs-xl, weight: "bold", fill: c-ink, id.name)
#v(4pt)
#text(size: fs-lg, fill: c-muted, id.headline)
#v(5pt)
#text(size: fs-meta, fill: c-muted)[
  #id.location#sep#link("mailto:" + id.email)[#id.email]#sep#id.phone#sep#link("https://" + id.linkedin)[#id.linkedin]
]

// ── Layout ───────────────────────────────────────────────────────────────────
#for section in data.layout.sections {
  let t  = section.at("type", default: "full")
  let br = section.at("breakable", default: true)

  if t == "columns" {
    let n-cols = section.at("columns", default: 2)
    let gutter = section.at("gutter_cm", default: 1.5) * 1cm
    let cols   = section.content
    let widths = range(n-cols).map(_ => 1fr)
    let cells  = cols.map(sids => [#for sid in sids { render-section(sid) }])
    block(breakable: br)[
      #grid(columns: widths, column-gutter: gutter, ..cells)
    ]
  } else {
    block(breakable: br)[#render-section(section.id)]
  }
}
