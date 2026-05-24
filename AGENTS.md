# CV Template Migration — Agent Guide

You are migrating an external Typst CV template into this project. When done, the template must:

1. Render correctly using data from `src/data/cv.json`
2. Appear in the `/templates` gallery
3. Support the layout editor (section order configurable via layout JSON)

Read this file fully before writing any code. Everything you need is here.

---

## Architecture in one sentence

**Data** (`cv.json`) → **Template** (`src/typst/templates/<name>.typ`) → **Layout** (`src/layouts/<name>-default.json`) → **PDF** (`public/cv-<name>.pdf`)

The template is the visual rendering engine. The layout JSON is the structural config (section order, columns, page-break behaviour). They are always separate files.

---

## Project file map

```
src/
  data/
    cv.json                        ← canonical data (gitignored, use cv.example.json as reference)
    cv.example.json                ← full schema with realistic fictional data
    templates.json                 ← gallery registry — add your template here
  typst/
    tokens.typ                     ← root scale knobs + all derived tokens
    styles.typ                      ← semantic aliases, colours, font, page settings
    components.typ                 ← cv-section(), pill(), sep()
    sections.typ                   ← render-section(id) dispatcher + all render-* functions
    templates/
      default.typ                  ← reference implementation — study this first
      modern.typ                   ← full-width header band example
      minimal.typ                  ← custom render functions example (no render-section)
      sidebar.typ                  ← sidebar layout example
      <your-template>.typ          ← you create this
  layouts/
    default.json                   ← reference layout JSON
    classic.json
    alt.json
    <your-template>-default.json   ← you create this
  app/
    templates/
      page.tsx                     ← server component, reads layout JSONs
      TemplatesGallery.tsx         ← client gallery + layout editor UI
      LayoutEditor.tsx             ← drag-and-drop layout editor
      actions.ts                   ← server action: write layout JSON + run Typst
scripts/
  generate-pdf.sh                  ← compile one template: bash generate-pdf.sh <template> [layout]
  generate-all-pdfs.sh             ← compile every registered template
```

---

## cv.json schema (full)

```jsonc
{
  "identity": {
    "name": "string",              // full name
    "headline": "string",          // title · company
    "location": "string",          // city, region, country
    "email": "string",
    "phone": "string",             // e.g. "+34 625 039 023"
    "linkedin": "string",          // e.g. "linkedin.com/in/handle"
    "experience_years": "string"   // e.g. "15+"
  },
  "summary": "string",             // multi-paragraph, paragraphs separated by \n\n

  "experience": [
    {
      "company": "string",
      "title": "string",           // full title, may contain "→" for promotions
      "period": "string",          // e.g. "Aug 2022 – present"
      "location": "string",
      "highlights": ["string"],    // bullet points, plain text
      "stack": ["string"]          // tech tags, rendered as pills
    }
  ],

  "education": [
    {
      "institution": "string",
      "degree": "string",
      "equivalent": "string",      // e.g. "Master's equivalent (EQF Level 7)"
      "period": "string",
      "notes": "string"
    }
  ],

  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "year": "string",            // may also be integer in some data files
      "expired": false             // optional bool, defaults to false
    }
  ],

  "skills": {
    "languages_and_frameworks": ["string"],
    "cloud_and_infrastructure": ["string"],
    "methodologies": ["string"]
  },

  "languages": [
    { "language": "string", "level": "string" }
  ],

  "awards": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",            // e.g. "April 2026"
      "description": "string"
    }
  ],

  "side_projects": [
    {
      "name": "string",
      "status": "string",          // e.g. "Active", "In progress"
      "description": "string",
      "stack": ["string"]
    }
  ]
}
```

---

## Available Typst tokens

All tokens are exported from `styles.typ` (which re-exports `tokens.typ`). Import with:

```typst
#import "../styles.typ": *
```

### Font scale
| Token | Size | Use |
|---|---|---|
| `fs-2xs` | ~6.5pt | pills, skill category labels (not style-overridable) |
| `fs-xs`  | ~7.5pt | section header labels → overridable via `section_heading_size` |
| `fs-sm`  | 8pt    | metadata, contact, cert names |
| `fs-md`  | ~8.5pt | body text, bullets → overridable via `body_size` |
| `fs-lg`  | ~9.5pt | entry titles (job, education, project) → overridable via `entry_size` |
| `fs-xl`  | 10pt   | document headline |
| `fs-2xl` | ~17pt  | document name |

### Style override system

`styles.typ` reads `/src/layouts/editor.json` when `--input layout=editor` is passed at compile time (editor preview only). It shadows the tokens above so that all render functions — including imported ones in `sections.typ` and `components.typ` — automatically use the user's chosen values.

```typst
// styles.typ injects these when in editor mode:
font-family  ← style.font_family
fs-md        ← style.body_size * 1pt
fs-lg        ← style.entry_size * 1pt
fs-xs        ← style.section_heading_size * 1pt
```

**Adding a new style param**: add it to `src/data/templates.json` → `styleParams`, then add a corresponding override line in `styles.typ`. It will immediately work for all templates in editor mode. No template file changes needed.

**Static compilation**: overrides are NOT applied (no editor.json read). Template-specific visual params (sidebar colors, header background) remain controlled per-template via the layout JSON's `style` key.

### Spacing scale
| Token | Value | Use |
|---|---|---|
| `sp-2xs` | ~0.10em | between tight items |
| `sp-xs`  | ~0.20em | minor gaps |
| `sp-sm`  | ~0.25em | within entry (title→meta) |
| `sp-md`  | ~0.35em | between minor entries |
| `sp-lg`  | ~0.45em | block spacing |
| `sp-xl`  | 0.50em  | between major entries |
| `sp-2xl` | ~0.70em | paragraph line leading |
| `sp-unit`| 0.5em   | base unit for custom scales |

### Margin scale
| Token | Value | Use |
|---|---|---|
| `margin-sm` | 1.1cm | vertical page margin |
| `margin-lg` | ~1.4cm | horizontal page margin |
| `margin-xs` | ~0.8cm | tight margin |
| `margin-2xs`| ~0.5cm | very tight |

### Column gutters
| Token | Value |
|---|---|
| `col-gutter-2` | ~1.2cm |
| `col-gutter-3` | ~0.8cm |
| `col-gutter-4` | ~0.5cm |

### Colours
| Token | Hex | Use |
|---|---|---|
| `c-ink`    | #111111 | name, entry titles |
| `c-body`   | #333333 | body text |
| `c-muted`  | #666666 | metadata, company, period |
| `c-light`  | #999999 | labels, pills |
| `c-rule`   | #dddddd | dividers, borders |
| `c-link`   | #1a56db | hyperlinks |
| `c-pill-bg`| #fafafa | pill background |

### Page settings (from styles.typ)
```typst
font-family    // "New Computer Modern"
page-paper     // "a4"
page-margin-x  // margin-lg
page-margin-y  // margin-sm
par-leading    // sp-2xl
block-spacing  // sp-lg
```

### Tracking
```typst
tracking-xs    // 0.6pt — rule stroke weight
tracking-sm    // 0.8pt — skill labels
tracking-lg    // 1.5pt — section header titles
```

---

## Available render functions (sections.typ)

`sections.typ` exports:
- `data` — the parsed cv.json (all fields as above)
- `render-section(id)` — dispatcher; call with any section ID

Section IDs and what they render:

| ID | Renders |
|---|---|
| `"summary"` | paragraphs from `data.summary` |
| `"experience"` | job entries with title, company, period, highlights, stack pills |
| `"awards"` | award entries with name, issuer, date, description |
| `"skills"` | 3-column grid of skill categories |
| `"education"` | education entries |
| `"languages"` | language + level inline list |
| `"certifications"` | cert name + issuer + year, expired support |
| `"side_projects"` | project entries with name, status, description, stack pills |

All section renders use `cv-section(title)` from `components.typ` for the heading (label + horizontal rule).

---

## Template file structure

### Pattern A: uses render-section (simplest, editor-compatible)

Copy `modern.typ` as your starting point. This pattern:
- Reads layout JSON for section order
- Uses `render-section()` for all body sections
- Header design is the only custom part

```typst
#import "../styles.typ": *
#import "../components.typ": *
#import "../sections.typ": *

#let id = data.identity
#let layout = json("/src/layouts/" + sys.inputs.at("layout", default: "<name>-default") + ".json")

// page setup
#set page(paper: page-paper, margin: (x: page-margin-x, y: page-margin-y))
#set text(font: font-family, size: fs-sm, fill: c-body, lang: "en")
#set par(justify: true, leading: par-leading)
#set block(above: block-spacing, below: block-spacing)
#show link: set text(fill: c-link)

// custom header here (the visual differentiator)

// layout loop — drives the editor
#for section in layout.sections {
  let t  = section.at("type", default: "full")
  let br = section.at("breakable", default: true)
  if t == "columns" {
    let n-cols = section.at("columns", default: 2)
    let gutter = if n-cols == 3 { col-gutter-3 } else if n-cols == 4 { col-gutter-4 } else { col-gutter-2 }
    let cells = section.content.map(sids => [#for sid in sids { render-section(sid) }])
    block(breakable: br)[
      #grid(columns: range(n-cols).map(_ => 1fr), column-gutter: gutter, ..cells)
    ]
  } else {
    block(breakable: br)[#render-section(section.id)]
  }
}
```

### Pattern B: custom render functions (full control, more work)

Copy `minimal.typ` as your starting point. This pattern:
- Imports only `data` from sections.typ (not render-section)
- Writes its own rendering for each section
- Must implement its own layout loop that dispatches to custom renderers
- Still benefits from styles.typ's style overrides (font-family, fs-md, fs-lg, fs-xs are all shadowed before your render functions are defined, so they capture the correct values automatically)

```typst
#import "../styles.typ": *
#import "../components.typ": *
#import "../sections.typ": data  // only data, not render-section

#let id = data.identity
#let layout = json("/src/layouts/" + sys.inputs.at("layout", default: "<name>-default") + ".json")

// custom section heading (different from cv-section)
#let my-section(title) = { ... }

// custom renderer per section ID
#let render-my-section(id) = {
  if id == "summary"     { /* custom summary */ }
  else if id == "experience" { /* custom experience */ }
  // ... all IDs
}

// page setup + header

// layout loop using custom dispatcher
#for section in layout.sections {
  // same loop structure as Pattern A but call render-my-section(sid)
}
```

Use Pattern A unless the external template has a fundamentally different visual style for section bodies (different bullet style, no rules, different entry layout). If only the header is different, Pattern A is always the right choice.

---

## Layout JSON schema

```jsonc
{
  "header": {
    "style": "split"     // "split" = name+headline left / contact right
                         // "stacked" = all in one column
  },
  "sections": [
    // Full-width section
    { "id": "summary", "breakable": true },

    // Another full-width section
    { "id": "experience", "breakable": true },

    // Multi-column group
    {
      "type": "columns",
      "columns": 2,           // 2, 3, or 4
      "breakable": true,
      "content": [
        ["education", "languages"],   // column 1 section IDs
        ["certifications"]            // column 2 section IDs
      ]
    }
  ]
}
```

Valid section IDs: `summary`, `experience`, `awards`, `skills`, `education`, `languages`, `certifications`, `side_projects`.

The same layout schema works for any template using Pattern A. You do not need to invent a new schema.

---

## Step-by-step migration

### 1. Study the external template

Fetch the source from GitHub (raw.githubusercontent.com). Identify:
- Header design: what information, what layout (split/stacked/sidebar/band?)
- Section structure: what sections exist, in what order?
- Custom render style: are bullets/entries visually different from our defaults?
- Data model: what fields does it use? Map each to our cv.json schema.

### 2. Choose Pattern A or B

- If only the header looks different → Pattern A
- If entries/bullets/section headings look fundamentally different → Pattern B

### 3. Create the layout JSON

File: `src/layouts/<name>-default.json`

List the sections in the order the external template shows them. Use the standard schema above. If the original template has a two-column section, represent it as a `"type": "columns"` entry.

### 4. Create the template .typ file

File: `src/typst/templates/<name>.typ`

- Start from the matching pattern (A or B)
- Implement the header to match the external template's visual style
- Use tokens from styles.typ for all sizes, colours, spacing — no hardcoded values
- The default layout reference in `sys.inputs.at("layout", default: "...")` should match your layout JSON filename (without `.json`)

### 5. Test compilation

```bash
bash scripts/generate-pdf.sh <name>
# → public/cv-<name>.pdf
```

Open the PDF and compare against the original template visually. Iterate.

### 6. Register in the gallery

Add an entry to `src/data/templates.json`:

```json
{
  "id": "<name>",
  "name": "Human-readable name",
  "description": "One sentence describing the visual style.",
  "layouts": [
    {
      "id": "<name>-default",
      "name": "Default",
      "description": "Brief layout description",
      "pdf": "/cv-<name>.pdf"
    }
  ]
}
```

### 7. Register in generate-all-pdfs.sh

Add to `scripts/generate-all-pdfs.sh`:
```bash
bash "$DIR/generate-pdf.sh" <name>
```

### 8. Verify the layout editor works

Open `http://localhost:3000/templates` and select your template. The layout editor panel should appear in the centre column (it appears automatically for any template registered in `templates.json`). Drag sections, click Generate PDF, verify the result matches the layout change.

If the editor doesn't appear, check that:
- `src/layouts/<name>-default.json` exists
- The template ID in `templates.json` matches the file in `src/typst/templates/`
- `page.tsx` reads layout files by matching `layout.id` to a file named `${layout.id}.json`

---

## Editor compatibility checklist

Before declaring migration done:

- [ ] `src/typst/templates/<name>.typ` compiles without errors
- [ ] Template reads layout JSON via `sys.inputs.at("layout", default: "...")`
- [ ] Layout loop handles both `"full"` and `"columns"` section types
- [ ] `src/layouts/<name>-default.json` exists and matches the section IDs
- [ ] Entry added to `src/data/templates.json` with correct PDF path
- [ ] Entry added to `scripts/generate-all-pdfs.sh`
- [ ] `bash scripts/generate-all-pdfs.sh` completes without error
- [ ] Layout editor appears at `/templates` for this template
- [ ] Dragging sections and clicking Generate PDF produces a valid updated PDF
- [ ] PDF download link works

---

## Common mistakes

**Wrong import paths** — templates are in `src/typst/templates/`, shared files are one level up. Always use `"../styles.typ"`, `"../components.typ"`, `"../sections.typ"`.

**Hardcoded section order** — if you write `render-section("summary")`, `render-section("experience")` directly in the template without reading from layout JSON, the editor cannot reorder them. Always use the layout loop.

**Absolute data paths** — Typst JSON imports use the `--root .` compile flag, so paths start from the project root: `json("/src/data/cv.json")`. Do not use relative paths for data.

**Wrong PDF URL in templates.json** — the PDF filename follows the generate script's naming: `default` template + `X` layout → `cv-X.pdf`; `Y` template + `default` layout → `cv-Y.pdf`; `Y` template + `X` layout → `cv-Y-X.pdf`.

**Missing layout for editor** — the editor panel only appears when `page.tsx` can read a layout JSON for the selected template+layout combination. The layout file must be named exactly `${layout.id}.json` and live in `src/layouts/`.
