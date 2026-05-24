#import "../styles.typ": *
#import "../components.typ": *
#import "../sections.typ": *

#let id = data.identity

// ── Layout + style overrides ──────────────────────────────────────────────────
#let layout-raw  = sys.inputs.at("layout", default: "default")
#let layout-file = if layout-raw == "editor" { "editor" } else { "modern-" + layout-raw }
#let layout      = json("/src/layouts/" + layout-file + ".json")
#let style       = layout.at("style", default: (:))

// ── Modern-specific tokens (overridable via layout.style) ─────────────────────
#let header-bg    = if "header_bg"    in style { rgb(style.header_bg)    } else { rgb("#111827") }
#let header-text  = rgb("#f9fafb")
#let header-muted = rgb("#9ca3af")
#let accent       = if "accent"       in style { rgb(style.accent)       } else { rgb("#3b82f6") }
#let font-family  = if "font_family"  in style { style.at("font_family") } else { font-family  }

// ── Feature flags ─────────────────────────────────────────────────────────────
#let show-footer         = style.at("show_footer",         default: show-footer-sys)         == "true"
#let show-qr             = style.at("show_qr",             default: show-qr-sys)             == "true"
#let show-contact-icons  = style.at("show_contact_icons",  default: show-contact-icons-sys)  == "true"
#let show-contact-labels = style.at("show_contact_labels", default: show-contact-labels-sys) == "true"

// ── Page: zero margin — all padding handled internally ────────────────────────
#set page(
  paper: page-paper,
  margin: (top: 0pt, left: 0pt, right: 0pt, bottom: if show-footer { footer-height } else { 0pt }),
  footer: if show-footer { cv-footer(id.contact) } else { none },
)
#set text(font: font-family, size: fs-sm, fill: c-body, lang: "en")
#set par(justify: true, leading: par-leading)
#set block(above: block-spacing, below: block-spacing)
#show link: set text(fill: accent)

// ── Header band ───────────────────────────────────────────────────────────────
#let header-contact = [
  #set par(justify: false)
  #text(size: fs-xs, fill: header-muted)[
    #for (ci, entry) in id.contact.enumerate() {
      if ci > 0 { h(gap-lg) }
      render-contact-entry(entry, show-icons: show-contact-icons, show-labels: show-contact-labels)
    }
  ]
]

#block(
  width: 100%,
  fill: header-bg,
  inset: (x: page-margin-x, top: 0.9cm, bottom: 0.75cm),
  breakable: false,
)[
  #if show-qr {
    grid(
      columns: (1fr, qr-size),
      column-gutter: sp-md,
      align: (left + horizon, right + top),
      [
        #text(size: fs-2xl, weight: "bold", fill: header-text, id.name)
        #v(sp-xs)
        #text(size: fs-xl, fill: header-muted, id.headline)
        #v(sp-md)
        #header-contact
      ],
      qr-block(),
    )
  } else {
    text(size: fs-2xl, weight: "bold", fill: header-text, id.name)
    v(sp-xs)
    text(size: fs-xl, fill: header-muted, id.headline)
    v(sp-md)
    header-contact
  }
]

// ── Body sections (layout-driven) ─────────────────────────────────────────────
#pad(x: page-margin-x, top: margin-sm)[
  #for section in layout.sections {
    let t    = section.at("type", default: "full")
    let br   = section.at("breakable", default: true)
    let pre  = if "pre_spacing"  in section { section.at("pre_spacing")  * 1em } else { section-pre  }
    let post = if "post_spacing" in section { section.at("post_spacing") * 1em } else { section-post }
    if t == "columns" {
      let n-cols = section.at("columns", default: 2)
      let gutter = if n-cols == 3 { col-gutter-3 } else if n-cols == 4 { col-gutter-4 } else { col-gutter-2 }
      let cells  = section.content.map(sids => [#for sid in sids { render-section(sid, pre: pre, post: post) }])
      block(breakable: br)[
        #grid(columns: range(n-cols).map(_ => 1fr), column-gutter: gutter, ..cells)
      ]
    } else {
      block(breakable: br)[#render-section(section.id, pre: pre, post: post)]
    }
  }
]
