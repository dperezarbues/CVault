#import "styles.typ": *

// ── PDF bookmark (invisible heading, out of flow) ─────────────────────────────
// When `id` is set, also attaches a Typst label so the heading becomes a
// jump target reachable via link(label("id")) or [text](#id) in cv data.
#let bookmark(title, level: 1, id: none) = {
  if id != none {
    place(hide([#heading(level: level, outlined: false, bookmarked: true)[#title] #label(id)]))
  } else {
    place(hide(heading(level: level, outlined: false, bookmarked: true, title)))
  }
}

// ── Section divider ───────────────────────────────────────────────────────────
#let cv-section(title, pre: section-pre, post: section-post, id: none) = {
  v(pre)
  bookmark(title, id: id)
  text(size: fs-xs, weight: "bold", tracking: section-tracking, fill: section-fill, upper(title))
  v(section-rule-gap, weak: true)
  line(length: 100%, stroke: rule-weight + rule-color)
  v(post)
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

// ── Inline link parser ────────────────────────────────────────────────────────
// Two syntaxes supported anywhere inside a JSON string value:
//   External URL:  [display text](https://example.com)
//   Internal jump: [display text](#section-id)   — jumps to that section in the PDF
//
// Section IDs match the keys in _sections: awards, experience, side_projects, etc.
// Multiple links per string and surrounding plain text are fully supported.
#let parse-links(s) = {
  let segs = s.split("](")
  if segs.len() == 1 { return [#s] }
  let output = []
  let carry = segs.first()
  for seg in segs.slice(1) {
    // carry ends with "[link-text"; seg starts with "dest)rest-of-text"
    let bracket-parts = carry.split("[")
    let before    = bracket-parts.slice(0, bracket-parts.len() - 1).join("[")
    let link-text = bracket-parts.last()
    let url-parts = seg.split(")")
    let url  = url-parts.first()
    let rest = url-parts.slice(1).join(")")
    // #anchor → internal PDF jump (only if the target label exists in this layout)
    // Falls back to plain text when the section is not rendered, preventing compile errors.
    let rendered = if url.starts-with("#") {
      let anchor = url.slice(1)
      context if query(label(anchor)).len() > 0 {
        link(label(anchor), [#link-text])
      } else {
        [#link-text]
      }
    } else {
      link(url, [#link-text])
    }
    output = output + [#before] + rendered
    carry = rest
  }
  output + [#carry]
}

// ── QR image (SVG generated server-side) ──────────────────────────────────────
#let qr-block(size: qr-size) = image("/public/qr-temp.svg", width: size)

// ── Contact helpers ───────────────────────────────────────────────────────────
// Builds the href for a contact entry (none for location — no link)
#let contact-href(entry) = {
  let t = entry.type
  let v = entry.value
  if      t == "email"    { "mailto:" + v }
  else if t == "phone"    { "tel:" + v }
  else if t == "location" { none }
  else if v.starts-with("http") { v }
  else { "https://" + v }
}

// Finds the first contact entry of a given type; returns its value or ""
#let find-contact(contact, t) = {
  let found = contact.filter(e => e.type == t)
  if found.len() > 0 { found.first().value } else { "" }
}

// Inline brand/type icon — SVGs use fill="currentColor".
// SVG currentColor does NOT propagate through box() in Typst, so we always patch
// the SVG source string before decoding. When fill is auto, context text.fill reads
// the ambient fill from the style chain (includes show link rules, set text rules, etc.)
// so icons inside link() content automatically inherit the link accent color.
// baseline: 25% drops the icon to sit roughly mid-body with adjacent text.
#let contact-icon(t, size: 0.9em, fill: auto) = {
  let known = ("linkedin", "github", "medium", "facebook", "email", "phone", "location", "web")
  let name  = if known.contains(t) { t } else { "web" }
  let path  = "/src/typst/icons/" + name + ".svg"
  context {
    let c   = if fill != auto { fill } else { text.fill }
    let hex = if type(c) == color { c.to-hex() } else { "#000000" }
    let svg = read(path).replace("currentColor", hex)
    box(baseline: 25%, image(bytes(svg), format: "svg", height: size))
  }
}

// Renders one contact entry inline. Three modes:
//   show-icons  = true  → [brand icon] value  (icon replaces key label)
//   show-labels = true  → key: value           (text label before value)
//   both false          → value only           (compact, no prefix)
// icon-fill: explicit color for the icon (auto = inherit via currentColor, works on
//   light backgrounds; pass sb-accent / link color for dark-background templates).
#let render-contact-entry(entry, show-icons: false, show-labels: false, icon-fill: auto) = {
  let href = contact-href(entry)
  let val  = entry.value
  let content = if show-icons {
    [#contact-icon(entry.type, fill: icon-fill)#h(0.25em)#val]
  } else if show-labels and entry.type != "location" {
    [#entry.key: #val]
  } else {
    [#val]
  }
  if href != none { link(href)[#content] } else { content }
}

// ── Schema normaliser — converts old-format CV JSON to current unified schema ──
// Old format used individual identity fields (email, phone, linkedin, location),
// section-specific field names (company, name, institution, language, …), and
// a skills object keyed by group name.  New format uses identity.contact array
// and a unified item shape (title, subtitle, period, description, highlights, tags).
// New-format files pass through unchanged; old-format files are uplifted in memory.
#let normalize-cv(d) = {
  // Identity → contact array
  let id = d.at("identity", default: (:))
  let new-id = if "contact" in id { id } else {
    let key-map = (location: "Location", email: "Email", phone: "Phone",
                   linkedin: "LinkedIn", github: "GitHub", medium: "Medium")
    let c = ()
    for t in ("location", "email", "phone", "linkedin", "github", "medium") {
      if t in id { c.push((type: t, value: id.at(t), key: key-map.at(t))) }
    }
    id + (contact: c)
  }

  // Experience
  let exp = d.at("experience", default: ()).map(job => {
    let sub = job.at("subtitle", default: {
      let co = job.at("company",  default: "")
      let lo = job.at("location", default: "")
      if co != "" and lo != "" { co + " · " + lo } else if co != "" { co } else { lo }
    })
    (title: job.at("title", default: ""), subtitle: sub,
     period: job.at("period", default: ""),
     highlights: job.at("highlights", default: ()),
     tags: job.at("tags", default: job.at("stack", default: ())))
  })

  // Awards
  let awards = d.at("awards", default: ()).map(a => {
    let sub = a.at("subtitle", default: {
      let iss = a.at("issuer", default: ""); let dt = a.at("date", default: "")
      if iss != "" and dt != "" { iss + " · " + dt } else if iss != "" { iss } else { dt }
    })
    (title: a.at("title", default: a.at("name", default: "")),
     subtitle: sub, description: a.at("description", default: ""))
  })

  // Certifications
  let certs = d.at("certifications", default: ()).map(c => {
    let sub = c.at("subtitle", default: {
      let iss = c.at("issuer", default: ""); let yr = c.at("year", default: "")
      if iss != "" and yr != "" { iss + " · " + yr } else if iss != "" { iss } else { yr }
    })
    let tags = if c.at("expired", default: false) { ("expired",) }
               else { c.at("tags", default: ()) }
    (title: c.at("title", default: c.at("name", default: "")),
     subtitle: sub, tags: tags)
  })

  // Education
  let edu = d.at("education", default: ()).map(e => {
    let sub = e.at("subtitle", default: {
      let deg = e.at("degree", default: ""); let eq = e.at("equivalent", default: "")
      if deg != "" and eq != "" { deg + " · " + eq } else if deg != "" { deg } else { eq }
    })
    (title: e.at("title", default: e.at("institution", default: "")),
     subtitle: sub, period: e.at("period", default: ""),
     description: e.at("description", default: e.at("notes", default: "")))
  })

  // Languages
  let langs = d.at("languages", default: ()).map(l => (
    title:    l.at("title",    default: l.at("language", default: "")),
    subtitle: l.at("subtitle", default: l.at("level",    default: "")),
  ))

  // Side projects
  let projs = d.at("side_projects", default: ()).map(p => (
    title:       p.at("title",       default: p.at("name",   default: "")),
    subtitle:    p.at("subtitle",    default: p.at("status", default: "")),
    description: p.at("description", default: ""),
    tags:        p.at("tags",        default: p.at("stack",  default: ())),
  ))

  // Leadership profile
  let lp-raw = d.at("leadership_profile", default: none)
  let lp-update = if lp-raw != none {
    let sub = lp-raw.at("subtitle", default:
      lp-raw.at("team_size", default: lp-raw.at("chapter_size", default: "")))
    let base = (subtitle: sub)
    let base = base + if "highlights"  in lp-raw { (highlights:  lp-raw.highlights)  } else { (:) }
    base + if "description" in lp-raw { (description: lp-raw.description) } else { (:) }
  } else { none }

  // Skills — object {group_name: [entries]} → array [{name, entries}]
  let new-skills = if "skills" not in d { () }
  else if type(d.skills) == array { d.skills }
  else {
    let s = d.skills
    let g = ()
    if "languages_and_frameworks" in s { g.push((name: "Languages & Frameworks", entries: s.languages_and_frameworks)) }
    if "cloud_and_infrastructure"  in s { g.push((name: "Cloud & Infrastructure",  entries: s.cloud_and_infrastructure)) }
    if "methodologies"             in s { g.push((name: "Methodologies",            entries: s.methodologies)) }
    g
  }

  let updates = (identity: new-id, experience: exp, awards: awards,
                 certifications: certs, education: edu, languages: langs,
                 side_projects: projs, skills: new-skills)
  let lp-dict = if lp-update != none { (leadership_profile: lp-update) } else { (:) }
  d + updates + lp-dict
}

// ── Page footer (page X / Y + linkedin URL) ───────────────────────────────────
// Accepts the full contact array and finds the linkedin entry automatically.
#let cv-footer(contact) = {
  set text(size: 5.5pt, fill: c-light)
  set par(justify: false, leading: 1em)
  let linkedin = find-contact(contact, "linkedin")
  let href = if linkedin != "" {
    if linkedin.starts-with("http") { linkedin } else { "https://" + linkedin }
  } else { "" }
  pad(x: 0pt, y: 2pt)[
    #grid(
      columns: (1fr, auto),
      if href != "" { link(href)[#linkedin] } else { [#linkedin] },
      context [#counter(page).get().first() / #counter(page).final().first()],
    )
  ]
}
