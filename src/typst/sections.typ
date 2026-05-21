#import "theme.typ": *
#import "components.typ": *

#let data = json("/src/data/cv.json")

// ── Summary ───────────────────────────────────────────────────────────────────
#let render-summary() = [
  #cv-section("Summary")
  #for (i, para) in data.summary.split("\n\n").enumerate() {
    if i > 0 { v(sp-lg) }
    text(size: fs-body, para)
  }
]

// ── Experience ────────────────────────────────────────────────────────────────
#let render-experience() = [
  #cv-section("Experience")
  #for (ji, job) in data.experience.enumerate() {
    if ji > 0 { v(sp-lg) }
    block(breakable: false)[
      #grid(
        columns: (1fr, auto),
        gutter: 4pt,
        text(size: fs-title, weight: "bold", fill: c-ink, job.title),
        text(size: fs-meta, fill: c-muted, job.period),
      )
      #v(sp-xs)
      #text(size: fs-meta, fill: c-muted)[#job.company — #job.location]
      #v(sp-xs)
      #for (hi, hl) in job.highlights.enumerate() {
        if hi > 0 { v(sp-sm) }
        if ji == 0 and hi == 2 {
          let needle = "Bolder Award (April 2026)"
          let parts = hl.split(needle)
          if parts.len() >= 2 [
            • #text(size: fs-body)[#(parts.at(0))#link(<bolder-award>)[Bolder Award (April 2026)]#(parts.at(1))]
          ] else [
            • #text(size: fs-body)[#hl]
          ]
        } else [
          • #text(size: fs-body)[#hl]
        ]
      }
      #if "stack" in job {
        v(sp-xs)
        for t in job.stack { pill(t); h(2pt) }
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
        gutter: 4pt,
        text(size: fs-title, weight: "bold", fill: c-ink, award.name),
        text(size: fs-meta, fill: c-muted)[#award.issuer · #award.date],
      )
      #v(sp-xs, weak: true)
      #text(size: fs-body, award.description)
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
      #text(size: fs-micro, weight: "bold", tracking: skills-label-tracking, fill: c-light)[LANGUAGES & FRAMEWORKS]
      #v(sp-xs, weak: true)
      #text(size: fs-meta, fill: c-body, s.languages_and_frameworks.join(dot))
    ],
    [
      #text(size: fs-micro, weight: "bold", tracking: skills-label-tracking, fill: c-light)[CLOUD & INFRASTRUCTURE]
      #v(sp-xs, weak: true)
      #text(size: fs-meta, fill: c-body, s.cloud_and_infrastructure.join(dot))
    ],
    [
      #text(size: fs-micro, weight: "bold", tracking: skills-label-tracking, fill: c-light)[METHODOLOGIES]
      #v(sp-xs, weak: true)
      #text(size: fs-meta, fill: c-body, s.methodologies.join(dot))
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
        gutter: 4pt,
        text(size: fs-title, weight: "bold", fill: c-ink, edu.institution),
        text(size: fs-meta, fill: c-muted, edu.period),
      )
      #v(sp-xs, weak: true)
      #text(size: fs-body, edu.degree) \
      #text(size: fs-meta, fill: c-muted, edu.equivalent) \
      #v(sp-xs, weak: true)
      #text(size: fs-meta, fill: c-muted, edu.notes)
    ]
  }
]

// ── Languages ─────────────────────────────────────────────────────────────────
#let render-languages() = [
  #cv-section("Languages")
  #set text(hyphenate: false)
  #for lang in data.languages [
    #text(size: fs-body)[*#lang.language* ]#text(size: fs-meta, fill: c-muted, lang.level)#h(10pt)
  ]
]

// ── Certifications ────────────────────────────────────────────────────────────
#let render-certifications() = [
  #cv-section("Certifications")
  #for (i, cert) in data.certifications.enumerate() {
    let expired = cert.at("expired", default: false)
    if i > 0 { v(sp-xs) }
    block(breakable: false)[
      #text(size: fs-meta, fill: if expired { c-light } else { c-body }, cert.name) \
      #text(size: fs-label, fill: c-light)[#cert.issuer · #cert.year#if expired [ · exp.]]
    ]
  }
]

// ── Side Projects ─────────────────────────────────────────────────────────────
#let render-side-projects() = [
  #cv-section("Side Projects & Interests")
  #for (i, proj) in data.side_projects.enumerate() {
    if i > 0 { v(sp-md) }
    block(breakable: false)[
      #text(size: fs-title, weight: "bold", fill: c-ink, proj.name)
      #h(4pt)
      #text(size: fs-label, fill: c-light, proj.status)
      #v(sp-xs, weak: true)
      #text(size: fs-body, proj.description)
      #if "stack" in proj {
        v(sp-xs, weak: true)
        for t in proj.stack { pill(t); h(2pt) }
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
