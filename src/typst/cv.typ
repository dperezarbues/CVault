#import "theme.typ": *
#import "components.typ": *
#import "sections.typ": *

// ── Data & layout ────────────────────────────────────────────────────────────
#let data   = json("/src/data/cv.json")
#let id     = data.identity
#let layout = json("/src/layouts/" + sys.inputs.at("layout", default: "default") + ".json")

// ── Page & typography ────────────────────────────────────────────────────────
#set page(paper: page-paper, margin: (x: page-margin-x, y: page-margin-y))
#set text(font: font-family, size: fs-sm, fill: c-body, lang: "en")
#set par(justify: true, leading: par-leading)
#set block(above: block-spacing, below: block-spacing)
#show link: set text(fill: c-link)

// ── Header ───────────────────────────────────────────────────────────────────
#let header-style = layout.at("header", default: (:)).at("style", default: "stacked")

#if header-style == "split" {
  grid(
    columns: (1fr, auto),
    align: (left + horizon, right + top),
    [
      #text(size: fs-2xl, weight: "bold", fill: c-ink, id.name)
      #v(sp-sm)
      #text(size: fs-xl, fill: c-muted, id.headline)
    ],
    [
      #set align(right)
      #set par(justify: false)
      #text(size: fs-sm, fill: c-muted, id.location) \
      #link("mailto:" + id.email)[#text(size: fs-sm, id.email)] \
      #link("tel:" + id.phone)[#text(size: fs-sm, id.phone)] \
      #link("https://" + id.linkedin)[#text(size: fs-sm, id.linkedin)]
    ],
  )
} else {
  text(size: fs-2xl, weight: "bold", fill: c-ink, id.name)
  v(sp-sm)
  text(size: fs-xl, fill: c-muted, id.headline)
  v(sp-xl)
  text(size: fs-sm, fill: c-muted)[
    #id.location#sep#link("mailto:" + id.email)[#id.email]#sep#link("tel:" + id.phone)[#id.phone]#sep#link("https://" + id.linkedin)[#id.linkedin]
  ]
}

// ── Layout ───────────────────────────────────────────────────────────────────
#for section in layout.sections {
  let t  = section.at("type", default: "full")
  let br = section.at("breakable", default: true)

  if t == "columns" {
    let n-cols = section.at("columns", default: 2)
    let gutter = if "gutter_cm" in section { section.gutter_cm * 1cm }
                 else if n-cols == 3 { col-gutter-3 }
                 else if n-cols == 4 { col-gutter-4 }
                 else { col-gutter-2 }
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
