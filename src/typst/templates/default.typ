#import "../styles.typ": *
#import "../components.typ": *
#import "../sections.typ": *

// ── Data & layout ────────────────────────────────────────────────────────────
// `data` is imported from sections.typ — do not re-import cv.json here
#let id     = data.identity
#let layout = json("/src/layouts/" + sys.inputs.at("layout", default: "default") + ".json")
#let style  = layout.at("style", default: (:))

// ── Feature flags ─────────────────────────────────────────────────────────────
#let show-footer         = style.at("show_footer",         default: show-footer-sys)         == "true"
#let show-qr             = style.at("show_qr",             default: show-qr-sys)             == "true"
#let show-contact-icons  = style.at("show_contact_icons",  default: show-contact-icons-sys)  == "true"
#let show-contact-labels = style.at("show_contact_labels", default: show-contact-labels-sys) == "true"
#let qr-url              = style.at("qr_url",              default: qr-url-sys)

// ── Page & typography ────────────────────────────────────────────────────────
#set page(
  paper: page-paper,
  margin: (x: page-margin-x, y: page-margin-y),
  footer: if show-footer { cv-footer(id.contact) } else { none },
)
#set text(font: font-family, size: fs-sm, fill: c-body, lang: "en")
#set par(justify: true, leading: par-leading)
#set block(above: block-spacing, below: block-spacing)
#show link: set text(fill: c-link)

// ── Header ───────────────────────────────────────────────────────────────────
#let header-style = layout.at("header", default: (:)).at("style", default: "stacked")

#if header-style == "split" {
  if show-qr {
    grid(
      columns: (1fr, auto, qr-size),
      column-gutter: sp-md,
      align: (left + horizon, right + top, right + top),
      [
        #text(size: fs-2xl, weight: "bold", fill: c-ink, id.name)
        #v(sp-sm)
        #text(size: fs-xl, fill: c-muted, id.headline)
      ],
      [
        #set align(right)
        #set par(justify: false)
        #for entry in id.contact [
          #render-contact-entry(entry, show-icons: show-contact-icons, show-labels: show-contact-labels) \
        ]
      ],
      qr-block(),
    )
  } else {
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
        #for entry in id.contact [
          #render-contact-entry(entry, show-icons: show-contact-icons, show-labels: show-contact-labels) \
        ]
      ],
    )
  }
} else {
  let stacked-content = [
    #text(size: fs-2xl, weight: "bold", fill: c-ink, id.name)
    #v(sp-sm)
    #text(size: fs-xl, fill: c-muted, id.headline)
    #v(sp-xl)
    #set par(justify: false)
    #set text(size: fs-sm, fill: c-muted)
    #for (ci, entry) in id.contact.enumerate() {
      if ci > 0 { sep }
      render-contact-entry(entry, show-icons: show-contact-icons, show-labels: show-contact-labels)
    }
  ]
  if show-qr {
    grid(columns: (1fr, qr-size), column-gutter: sp-md, stacked-content, qr-block())
  } else {
    stacked-content
  }
}

// ── Layout ───────────────────────────────────────────────────────────────────
#for section in layout.sections {
  let t    = section.at("type", default: "full")
  let br   = section.at("breakable", default: true)
  let pre  = if "pre_spacing"  in section { section.at("pre_spacing")  * 1em } else { section-pre  }
  let post = if "post_spacing" in section { section.at("post_spacing") * 1em } else { section-post }

  if t == "columns" {
    let n-cols = section.at("columns", default: 2)
    let gutter = if "gutter_cm" in section { section.gutter_cm * 1cm }
                 else if n-cols == 3 { col-gutter-3 }
                 else if n-cols == 4 { col-gutter-4 }
                 else { col-gutter-2 }
    let cols   = section.content
    let widths = range(n-cols).map(_ => 1fr)
    let cells  = cols.map(sids => [#for sid in sids { render-section(sid, pre: pre, post: post) }])
    block(breakable: br)[
      #grid(columns: widths, column-gutter: gutter, ..cells)
    ]
  } else {
    block(breakable: br)[#render-section(section.id, pre: pre, post: post)]
  }
}
