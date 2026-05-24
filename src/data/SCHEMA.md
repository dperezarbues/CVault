# CV Data Schema

## identity

```json
{
  "name": "string",
  "headline": "string",
  "contact": [ContactEntry]
}
```

### ContactEntry

```json
{ "type": "email | phone | location | linkedin | github | web", "value": "string", "key": "string" }
```

- `type` drives link generation and the sigil shown when `show_contact_icons` is on
- `key` is the label shown when icons are off (e.g. "LinkedIn", "Medium")
- Order in the array controls display order in all templates
- URL prefix by type: `email` → `mailto:`, `phone` → `tel:`, `location` → no link, everything else → `https://` (added automatically if value doesn't start with `http`)

**Sigils** (shown when `show_contact_icons` style param is toggled on):

| type | sigil |
|---|---|
| location | ◎ |
| email | @ |
| phone | ✆ |
| linkedin | in |
| github | gh |
| web | ↗ |

---

## Sections

All sections listed in `_sections` are data-driven. The templates have three dedicated renderers:

| Renderer | Sections |
|---|---|
| `render-contact` | contact (sidebar only) |
| `render-summary` | summary (plain string) |
| `render-skills` | skills (multi-column groups) |
| `render-generic` | everything else |

### skills

Array of named groups — templates render them in a multi-column grid without hardcoding group names.

```json
[
  { "name": "Languages & Frameworks", "entries": ["TypeScript", "React", ...] },
  { "name": "Cloud & Infrastructure", "entries": ["AWS", "Kubernetes", ...] }
]
```

### Unified item shape

All other array sections use the same shape. All fields except `title` are optional.

```json
{
  "title":       "string — main heading (bold)",
  "subtitle":    "string — secondary line, muted (company · location, issuer · date, etc.)",
  "period":      "string — right-aligned date range",
  "description": "string — prose paragraph (supports [link](url) and [text](#section-id) syntax)",
  "highlights":  ["string — bullet point (supports inline links)"],
  "tags":        ["string — rendered as pills (tech stack, status, expired, etc.)"]
}
```

**Section mapping:**

| Section | title | subtitle | period | description | highlights | tags |
|---|---|---|---|---|---|---|
| experience | job title | company · location | period | — | bullets | stack |
| awards | award name | issuer · date | — | prose | — | — |
| certifications | cert name | issuer · year | — | — | — | `["expired"]` if applicable |
| side_projects | project name | status | — | prose | — | stack |
| education | institution | degree · equivalent | period | notes | — | — |
| languages | language name | proficiency level | — | — | — | — |
| leadership_profile | *(single object, no title)* | team size | — | — | bullets | — |

### Single-object sections

`leadership_profile` and any custom single-object section uses:

```json
{
  "subtitle":    "optional — rendered as muted line above highlights",
  "description": "optional — prose paragraph",
  "highlights":  ["optional — bullet list"]
}
```

---

## Inline links

Supported anywhere in `description`, `highlights`, and `summary` strings:

```
[display text](https://example.com)    → external URL
[display text](#section-id)            → jumps to section inside the PDF
```

Valid internal IDs: `summary`, `experience`, `awards`, `skills`, `education`,
`languages`, `certifications`, `side_projects`, `core_strengths`, `leadership_profile`

---

## Style params (editor)

| key | type | effect |
|---|---|---|
| `show_contact_icons` | toggle | show type sigils instead of key labels in contact |
| `show_footer` | toggle | page X/Y footer |
| `show_qr` | toggle | QR code in header |
| `qr_url` | text | QR target (defaults to first linkedin entry) |
