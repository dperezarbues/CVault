#import "theme.typ": *
#import "components.typ": *

#let data = json("/src/data/cv.json")

// ── Summary ───────────────────────────────────────────────────────────────────
#let render-summary() = [
  #cv-section("Summary")
  #for (i, para) in data.summary.split("\n\n").enumerate() {
    if i > 0 { v(sp-xl) }
    text(size: fs-md, para)
  }
]

// ── Experience ────────────────────────────────────────────────────────────────
#let render-experience() = [
  #cv-section("Experience")
  #for (ji, job) in data.experience.enumerate() {
    if ji > 0 { v(sp-xl) }
    block(breakable: false)[
      #grid(
        columns: (1fr, auto),
        gutter: sp-sm,
        text(size: fs-lg, weight: "bold", fill: c-ink, job.title),
        text(size: fs-sm, fill: c-muted, job.period),
      )
      #v(sp-sm)
      #text(size: fs-sm, fill: c-muted)[#job.company — #job.location]
      #v(sp-sm)
      #for (hi, hl) in job.highlights.enumerate() {
        if hi > 0 { v(sp-2xs) }
        if ji == 0 and hi == 2 {
          let needle = "Bolder Award (April 2026)"
          let parts = hl.split(needle)
          if parts.len() >= 2 [
            • #text(size: fs-md)[#(parts.at(0))#link(<bolder-award>)[Bolder Award (April 2026)]#(parts.at(1))]
          ] else [
            • #text(size: fs-md)[#hl]
          ]
        } else [
          • #text(size: fs-md)[#hl]
        ]
      }
      #if "stack" in job {
        v(sp-sm)
        for t in job.stack { pill(t); h(pill-gap) }
      }
    ]
  }
]

// ── Awards ────────────────────────────────────────────────────────────────────
#let render-awards() = [
  #cv-section("Awards")
  #metadata("") <bolder-award>
  #for (i, award) in data.awards.enumerate() {
    if i > 0 { v(sp-md) }
    block(breakable: false)[
      #grid(
        columns: (1fr, auto),
        gutter: sp-sm,
        text(size: fs-lg, weight: "bold", fill: c-ink, award.name),
        text(size: fs-sm, fill: c-muted)[#award.issuer · #award.date],
      )
      #v(sp-sm)
      #text(size: fs-md, award.description)
    ]
  }
]

// ── Skills ────────────────────────────────────────────────────────────────────
#let render-skills() = [
  #cv-section("Skills")
  #set par(justify: false)
  #set text(hyphenate: false)
  #let s = data.skills
  #let dot = "\u{00a0}· "
  #grid(
    columns: (1fr, 1fr, 1fr),
    column-gutter: skills-gutter,
    [
      #text(size: fs-2xs, weight: "bold", tracking: skills-label-tracking, fill: c-light)[LANGUAGES & FRAMEWORKS]
      #v(sp-sm, weak: true)
      #text(size: fs-sm, fill: c-body, s.languages_and_frameworks.join(dot))
    ],
    [
      #text(size: fs-2xs, weight: "bold", tracking: skills-label-tracking, fill: c-light)[CLOUD & INFRASTRUCTURE]
      #v(sp-sm, weak: true)
      #text(size: fs-sm, fill: c-body, s.cloud_and_infrastructure.join(dot))
    ],
    [
      #text(size: fs-2xs, weight: "bold", tracking: skills-label-tracking, fill: c-light)[METHODOLOGIES]
      #v(sp-sm, weak: true)
      #text(size: fs-sm, fill: c-body, s.methodologies.join(dot))
    ],
  )
]

// ── Education ─────────────────────────────────────────────────────────────────
#let render-education() = [
  #cv-section("Education")
  #for (i, edu) in data.education.enumerate() {
    if i > 0 { v(sp-md) }
    block(breakable: false)[
      #grid(
        columns: (1fr, auto),
        gutter: sp-sm,
        text(size: fs-lg, weight: "bold", fill: c-ink, edu.institution),
        text(size: fs-sm, fill: c-muted, edu.period),
      )
      #v(sp-sm, weak: true)
      #text(size: fs-md, edu.degree) \
      #text(size: fs-sm, fill: c-muted, edu.equivalent) \
      #v(sp-sm, weak: true)
      #text(size: fs-sm, fill: c-muted, edu.notes)
    ]
  }
]

// ── Languages ─────────────────────────────────────────────────────────────────
#let render-languages() = [
  #cv-section("Languages")
  #set text(hyphenate: false)
  #for lang in data.languages [
    #text(size: fs-md)[*#lang.language* ]#text(size: fs-sm, fill: c-muted, lang.level)#h(gap-lg)
  ]
]

// ── Certifications ────────────────────────────────────────────────────────────
#let render-certifications() = [
  #cv-section("Certifications")
  #for (i, cert) in data.certifications.enumerate() {
    let expired = cert.at("expired", default: false)
    if i > 0 { v(sp-sm) }
    block(breakable: false)[
      #text(size: fs-sm, fill: if expired { c-light } else { c-body }, cert.name) \
      #text(size: fs-xs, fill: c-light)[#cert.issuer · #cert.year#if expired [ · exp.]]
    ]
  }
]

// ── Side Projects ─────────────────────────────────────────────────────────────
#let render-side-projects() = [
  #cv-section("Side Projects & Interests")
  #for (i, proj) in data.side_projects.enumerate() {
    if i > 0 { v(sp-md) }
    block(breakable: false)[
      #text(size: fs-lg, weight: "bold", fill: c-ink, proj.name)
      #h(gap-xs)
      #text(size: fs-xs, fill: c-light, proj.status)
      #v(sp-sm)
      #text(size: fs-md, proj.description)
      #if "stack" in proj {
        v(sp-sm)
        for t in proj.stack { pill(t); h(pill-gap) }
      }
    ]
  }
]

// ── Dispatcher ────────────────────────────────────────────────────────────────
#let render-section(id) = {
  if id == "summary"             { render-summary() }
  else if id == "experience"     { render-experience() }
  else if id == "awards"         { render-awards() }
  else if id == "skills"         { render-skills() }
  else if id == "education"      { render-education() }
  else if id == "languages"      { render-languages() }
  else if id == "certifications" { render-certifications() }
  else if id == "side_projects"  { render-side-projects() }
}
