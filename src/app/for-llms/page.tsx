import Link from 'next/link'
import MarkProof from '@/components/proof/MarkProof'
import ProofButton from '@/components/proof/ProofButton'

export const metadata = {
  title: 'Schema Reference — Proof',
  description:
    'Complete CV JSON schema and layout/style reference for Proof. For LLMs and agents generating CV data.',
}

// ── Reusable section shell ────────────────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        borderTop: '1px solid var(--c-line)',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        scrollMarginTop: '5rem',
      }}
    >
      <h2
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: 'var(--c-ink)',
          marginBottom: '1.25rem',
          fontFamily: 'var(--f-display)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  name,
  type,
  req,
  desc,
  children,
}: {
  name: string
  type: string
  req?: boolean
  desc: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--c-line2)' }}
      className="last:border-0"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap' as const,
          marginBottom: 2,
        }}
      >
        <code
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 600,
            background: 'var(--c-accent-soft)',
            color: 'var(--c-accent-deep)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          {name}
        </code>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-faint)' }}>
          {type}
        </span>
        {req && (
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--c-accent)',
              fontWeight: 600,
            }}
          >
            required
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: 'var(--c-sub)', lineHeight: 1.6 }}>{desc}</p>
      {children}
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: '#0E0B08',
        color: 'rgba(255,255,255,0.7)',
        borderRadius: 4,
        padding: '1rem',
        fontSize: 11,
        fontFamily: 'var(--f-mono)',
        overflowX: 'auto',
        lineHeight: 1.65,
        whiteSpace: 'pre',
      }}
    >
      {children}
    </pre>
  )
}

function Tag({
  children,
  color = 'gray',
}: {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green'
}) {
  const styles: Record<string, React.CSSProperties> = {
    gray: { background: 'var(--c-paper-deep)', color: 'var(--c-sub)' },
    blue: { background: 'var(--c-accent-soft)', color: 'var(--c-accent-deep)' },
    green: { background: '#e6f4ec', color: '#2a7a4a' },
  }
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 6px',
        borderRadius: 3,
        fontFamily: 'var(--f-mono)',
        ...styles[color],
      }}
    >
      {children}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForLlmsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-paper)' }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: '1px solid var(--c-line)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 896,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <MarkProof size={26} />
            <span
              style={{
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: '-0.02em',
                color: 'var(--c-ink)',
                fontFamily: 'var(--f-display)',
              }}
            >
              Proof
            </span>
          </Link>
          <span style={{ color: 'var(--c-line)', fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: 'var(--c-sub)' }}>Schema reference</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="/llms-full.txt"
            className="mono-link"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-faint)' }}
          >
            llms-full.txt
          </a>
          <a
            href="/llms.txt"
            className="mono-link"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-faint)' }}
          >
            llms.txt
          </a>
          <ProofButton href="/editor" variant="dark" size="sm">
            Open editor →
          </ProofButton>
        </div>
      </nav>

      <div style={{ maxWidth: 896, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: 'var(--c-ink)',
              marginBottom: '0.5rem',
              fontFamily: 'var(--f-display)',
            }}
          >
            Schema Reference
          </h1>
          <p style={{ color: 'var(--c-sub)', fontSize: 13, lineHeight: 1.65, maxWidth: 520 }}>
            Complete reference for generating valid Proof data. Covers the CV content JSON, layout
            structure, and all style parameters for each template. Intended for LLMs and agents
            producing CV files for import.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: '1rem' }}>
            {[
              ['#cv-json', 'CV JSON'],
              ['#sections', 'Sections'],
              ['#layout', 'Layout JSON'],
              ['#style', 'Style params'],
              ['#tips', 'Tips'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'var(--c-paper-deep)',
                  color: 'var(--c-ink)',
                  padding: '4px 10px',
                  borderRadius: 3,
                  textDecoration: 'none',
                  border: '1px solid var(--c-line)',
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── 1. CV JSON ────────────────────────────────────────────────── */}
        <Section id="cv-json" title="1 · CV JSON schema">
          <p style={{ fontSize: 13, color: 'var(--c-sub)', marginBottom: '1.25rem' }}>
            The CV is a single JSON object. All sections are optional except{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              identity
            </code>
            . Text fields in{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              highlights
            </code>
            ,{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              description
            </code>
            , and{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              summary
            </code>{' '}
            support Markdown-style links:{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              [text](https://url)
            </code>
            .
          </p>

          <Code>{`{
  "identity": {
    "name": "Ada Lovelace",
    "headline": "Software Engineer & Mathematician",
    "contact": [
      { "type": "email",    "value": "ada@example.com",               "key": "Email"    },
      { "type": "phone",    "value": "+44 7000 000000",               "key": "Phone"    },
      { "type": "location", "value": "London, UK",                    "key": "Location" },
      { "type": "linkedin", "value": "linkedin.com/in/adalovelace",   "key": "LinkedIn" },
      { "type": "github",   "value": "github.com/ada",                "key": "GitHub"   },
      { "type": "web",      "value": "adalovelace.io",                "key": "Website"  }
    ]
  },

  "summary": "First paragraph of your summary.\\n\\nSecond paragraph (blank line = new paragraph).",

  "experience": [
    {
      "title":      "Principal Engineer",
      "subtitle":   "Acme Corp · London",
      "period":     "2021 – Present",
      "highlights": [
        "Led migration of monolith to microservices, reducing p99 latency by 40%.",
        "Built internal platform adopted by 5 teams; see [case study](https://example.com)."
      ],
      "tags": ["Go", "Kubernetes", "PostgreSQL"]
    }
  ],

  "education": [
    {
      "title":       "University of Cambridge",
      "subtitle":    "MA · Mathematics",
      "period":      "2015 – 2019",
      "description": "Optional notes, thesis title, honours, etc."
    }
  ],

  "skills": [
    { "name": "Languages & Frameworks", "entries": ["Go", "TypeScript", "React", "Python"] },
    { "name": "Cloud & Infrastructure",  "entries": ["AWS", "GCP", "Kubernetes", "Terraform"] },
    { "name": "Methodologies",           "entries": ["DDD", "TDD", "Event Sourcing"] }
  ],

  "languages": [
    { "title": "English", "subtitle": "Native" },
    { "title": "Spanish", "subtitle": "Professional working proficiency" }
  ],

  "certifications": [
    {
      "title":    "AWS Solutions Architect – Professional",
      "subtitle": "Amazon Web Services · 2023",
      "tags":     []
    },
    {
      "title":    "CKA: Certified Kubernetes Administrator",
      "subtitle": "CNCF · 2021",
      "tags":     ["expired"]
    }
  ],

  "awards": [
    {
      "title":       "Best Paper Award",
      "subtitle":    "IEEE Conference on Software Engineering · 2022",
      "description": "Optional description. Supports [links](https://example.com)."
    }
  ],

  "side_projects": [
    {
      "title":       "typst-cv",
      "subtitle":    "open source",
      "description": "A Typst template library for CVs. [GitHub](https://github.com/example/typst-cv).",
      "tags":        ["Typst", "Open Source"]
    }
  ]
}`}</Code>

          <div style={{ marginTop: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--c-faint)',
                marginBottom: '0.75rem',
              }}
            >
              identity.contact — type values
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ['email', 'Renders as mailto: link'],
                ['phone', 'Renders as tel: link'],
                ['location', 'Plain text, no link'],
                ['linkedin', 'Uses LinkedIn icon'],
                ['github', 'Uses GitHub icon'],
                ['medium', 'Uses Medium icon'],
                ['web', 'Generic globe icon'],
              ].map(([t, d]) => (
                <div
                  key={t}
                  style={{
                    background: 'var(--c-card)',
                    borderRadius: 4,
                    padding: '8px 12px',
                    border: '1px solid var(--c-line)',
                  }}
                >
                  <code
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: 'var(--c-accent-deep)',
                    }}
                  >
                    {t}
                  </code>
                  <p style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 2 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. Section IDs ───────────────────────────────────────────── */}
        <Section id="sections" title="2 · Available section IDs">
          <p style={{ fontSize: 13, color: 'var(--c-sub)', marginBottom: '1rem' }}>
            These are the built-in section IDs that the editor and templates know about. The sidebar
            template can also render any of these in the left column.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--c-faint)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ paddingBottom: 8, paddingRight: 24, fontWeight: 600 }}>ID</th>
                  <th style={{ paddingBottom: 8, paddingRight: 24, fontWeight: 600 }}>JSON key</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['summary', 'summary', 'string'],
                  ['experience', 'experience', 'array'],
                  ['education', 'education', 'array'],
                  ['skills', 'skills', 'array of groups'],
                  ['languages', 'languages', 'array'],
                  ['certifications', 'certifications', 'array'],
                  ['awards', 'awards', 'array'],
                  ['side_projects', 'side_projects', 'array'],
                  ['contact', 'identity.contact', 'sidebar only — renders contact list'],
                  ['core_strengths', 'core_strengths', 'sidebar only — string[] of bullet points'],
                ].map(([id, key, note]) => (
                  <tr
                    key={id}
                    style={{ borderTop: '1px solid var(--c-line2)', color: 'var(--c-ink2)' }}
                  >
                    <td style={{ padding: '8px 24px 8px 0' }}>
                      <code
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 11,
                          color: 'var(--c-accent-deep)',
                        }}
                      >
                        {id}
                      </code>
                    </td>
                    <td style={{ padding: '8px 24px 8px 0' }}>
                      <code
                        style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-sub)' }}
                      >
                        {key}
                      </code>
                    </td>
                    <td style={{ padding: '8px 0', fontSize: 12, color: 'var(--c-sub)' }}>
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--c-faint)', marginTop: '1rem' }}>
            Custom sections: any top-level key not listed above is rendered generically (supports
            strings, string arrays, and arrays of objects with title/subtitle/description).
          </p>
        </Section>

        {/* ── 3. Layout JSON ───────────────────────────────────────────── */}
        <Section id="layout" title="3 · Layout JSON structure">
          <p style={{ fontSize: 13, color: 'var(--c-sub)', marginBottom: '1.25rem' }}>
            When you generate a PDF from the editor, a layout JSON is compiled alongside the CV
            data. You can also produce layout JSON directly to control section order, columns, and
            per-section spacing.
          </p>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginBottom: '0.75rem',
            }}
          >
            Top-level fields
          </p>
          <div>
            <Field
              name="header"
              type="object"
              req
              desc='Controls the header style. For default/minimal: {"style": "split" | "stacked"}. For modern: {"style": "band"}. For sidebar: {"style": "sidebar"}.'
            />
            <Field
              name="sections"
              type="array"
              req
              desc="Array of main-column section entries (see below)."
            />
            <Field
              name="sidebar_sections"
              type="array"
              desc="Sidebar template only. Array of sidebar section entries."
            />
            <Field
              name="style"
              type="object"
              desc="Style overrides (see §4). Applied on top of template defaults."
            />
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Section entry — full type
          </p>
          <Code>{`{ "id": "experience", "breakable": true, "pre_spacing": 0.5, "post_spacing": 0.2 }`}</Code>
          <div style={{ marginTop: '0.75rem' }}>
            <Field name="id" type="string" req desc="Section ID from §2." />
            <Field
              name="breakable"
              type="boolean"
              desc="Whether Typst may insert a page break before this block. Default: true."
            />
            <Field
              name="pre_spacing"
              type="number (em)"
              desc="Space above the section title. Overrides template default."
            />
            <Field
              name="post_spacing"
              type="number (em)"
              desc="Space below the section rule. Overrides template default."
            />
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Section entry — columns type
          </p>
          <Code>{`{
  "type": "columns",
  "columns": 2,
  "breakable": true,
  "content": [
    ["education", "languages"],
    ["certifications"]
  ]
}`}</Code>
          <div style={{ marginTop: '0.75rem' }}>
            <Field
              name="type"
              type='"columns"'
              req
              desc='Must be "columns" to activate this variant.'
            />
            <Field name="columns" type="2 | 3 | 4" desc="Number of columns. Default: 2." />
            <Field
              name="content"
              type="string[][]"
              req
              desc="Array of column contents; each element is an array of section IDs for that column."
            />
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Complete layout examples
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p style={{ fontSize: 12, color: 'var(--c-faint)', marginBottom: 8 }}>
                Default / Minimal
              </p>
              <Code>{`{
  "header": { "style": "split" },
  "sections": [
    { "id": "summary",      "breakable": true  },
    { "id": "experience",   "breakable": true  },
    { "id": "skills",       "breakable": false },
    {
      "type": "columns",
      "columns": 2,
      "breakable": true,
      "content": [
        ["education", "languages"],
        ["certifications"]
      ]
    }
  ]
}`}</Code>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--c-faint)', marginBottom: 8 }}>Sidebar</p>
              <Code>{`{
  "header": { "style": "sidebar" },
  "sidebar_sections": [
    { "id": "contact",        "breakable": false },
    { "id": "skills",         "breakable": true  },
    { "id": "languages",      "breakable": false },
    { "id": "certifications", "breakable": true  }
  ],
  "sections": [
    { "id": "summary",    "breakable": true },
    { "id": "experience", "breakable": true },
    { "id": "education",  "breakable": false }
  ]
}`}</Code>
            </div>
          </div>
        </Section>

        {/* ── 4. Style parameters ──────────────────────────────────────── */}
        <Section id="style" title="4 · Style parameters">
          <p style={{ fontSize: 13, color: 'var(--c-sub)', marginBottom: '1.25rem' }}>
            Style values live in the{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
                color: 'var(--c-ink)',
              }}
            >
              style
            </code>{' '}
            key of the layout JSON. All are optional — omit any to use the template default.
          </p>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginBottom: '0.75rem',
            }}
          >
            Common — all templates
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--c-faint)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Key</th>
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Type</th>
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>
                    Range / options
                  </th>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Default</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--f-mono)' }}>
                {[
                  [
                    'font_family',
                    'select',
                    'New Computer Modern, Libertinus Serif, Helvetica Neue, Optima, Georgia',
                    'New Computer Modern',
                  ],
                  ['name_size', 'number', '12 – 24 pt', '17'],
                  ['headline_size', 'number', '8 – 14 pt', '10'],
                  ['entry_size', 'number', '8.5 – 12 pt', '9.5'],
                  ['body_size', 'number', '7.5 – 11 pt', '8.5'],
                  ['section_heading_size', 'number', '6 – 10 pt', '7.5'],
                  ['body_color', 'hex', 'any hex', '#333333'],
                  ['heading_color', 'hex', 'any hex', '#111111'],
                  ['muted_color', 'hex', 'any hex', '#666666'],
                  ['line_height', 'number', '0.5 – 1.2 em', '0.7'],
                  ['section_pre', 'number', '0.2 – 0.9 em', '0.5'],
                  ['section_post', 'number', '0.05 – 0.4 em', '0.2'],
                  ['section_rule_gap', 'number', '0 – 0.5 em', '0.2'],
                  ['show_footer', 'string', '"true" | "false"', '"false"'],
                  ['show_qr', 'string', '"true" | "false"', '"false"'],
                  ['qr_url', 'string', 'any URL', '""'],
                  ['show_contact_icons', 'string', '"true" | "false"', '"false"'],
                  ['show_contact_labels', 'string', '"true" | "false"', '"false"'],
                ].map(([k, t, r, d]) => (
                  <tr
                    key={k}
                    style={{ borderTop: '1px solid var(--c-line2)', color: 'var(--c-ink2)' }}
                  >
                    <td style={{ padding: '6px 16px 6px 0', color: 'var(--c-accent-deep)' }}>
                      {k}
                    </td>
                    <td style={{ padding: '6px 16px 6px 0', color: 'var(--c-sub)' }}>{t}</td>
                    <td
                      style={{
                        padding: '6px 16px 6px 0',
                        color: 'var(--c-sub)',
                        fontFamily: 'var(--f-display)',
                        fontSize: 11,
                      }}
                    >
                      {r}
                    </td>
                    <td style={{ padding: '6px 0', color: 'var(--c-sub)' }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginBottom: '0.75rem',
            }}
          >
            Template-specific — <Tag color="blue">default</Tag> &amp;{' '}
            <Tag color="blue">minimal</Tag>
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--c-faint)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Key</th>
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Default</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Purpose</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--f-mono)' }}>
                <tr style={{ borderTop: '1px solid var(--c-line2)', color: 'var(--c-ink2)' }}>
                  <td style={{ padding: '6px 16px 6px 0', color: 'var(--c-accent-deep)' }}>
                    accent_color
                  </td>
                  <td style={{ padding: '6px 16px 6px 0' }}>#1a56db</td>
                  <td
                    style={{
                      padding: '6px 0',
                      fontFamily: 'var(--f-display)',
                      fontSize: 11,
                      color: 'var(--c-sub)',
                    }}
                  >
                    Hyperlinks and section accents
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginBottom: '0.75rem',
            }}
          >
            Template-specific — <Tag color="green">modern</Tag>
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--c-faint)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Key</th>
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Default</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Purpose</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--f-mono)' }}>
                {[
                  ['header_bg', '#111827', 'Dark band header background'],
                  ['accent', '#3b82f6', 'Hyperlinks and accent elements'],
                ].map(([k, d, p]) => (
                  <tr
                    key={k}
                    style={{ borderTop: '1px solid var(--c-line2)', color: 'var(--c-ink2)' }}
                  >
                    <td style={{ padding: '6px 16px 6px 0', color: 'var(--c-accent-deep)' }}>
                      {k}
                    </td>
                    <td style={{ padding: '6px 16px 6px 0' }}>{d}</td>
                    <td
                      style={{
                        padding: '6px 0',
                        fontFamily: 'var(--f-display)',
                        fontSize: 11,
                        color: 'var(--c-sub)',
                      }}
                    >
                      {p}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginBottom: '0.75rem',
            }}
          >
            Template-specific — <Tag>sidebar</Tag>
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--c-faint)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Key</th>
                  <th style={{ paddingBottom: 8, paddingRight: 16, fontWeight: 600 }}>Default</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Purpose</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--f-mono)' }}>
                {[
                  ['sidebar_bg', '#1e2d3d', 'Sidebar background colour'],
                  ['sidebar_accent', '#5b9bd5', 'Sidebar section heading colour'],
                  ['sidebar_link_color', '#5b9bd5', 'Links and icons in the sidebar'],
                  ['sidebar_text', '#bcc8d4', 'Body text in the sidebar'],
                  ['sidebar_width', '6.5', 'Sidebar width in cm (4.5 – 9.0)'],
                  ['accent_color', '#1a56db', 'Links in the main column'],
                ].map(([k, d, p]) => (
                  <tr
                    key={k}
                    style={{ borderTop: '1px solid var(--c-line2)', color: 'var(--c-ink2)' }}
                  >
                    <td style={{ padding: '6px 16px 6px 0', color: 'var(--c-accent-deep)' }}>
                      {k}
                    </td>
                    <td style={{ padding: '6px 16px 6px 0' }}>{d}</td>
                    <td
                      style={{
                        padding: '6px 0',
                        fontFamily: 'var(--f-display)',
                        fontSize: 11,
                        color: 'var(--c-sub)',
                      }}
                    >
                      {p}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Style embedded in layout — example
          </p>
          <Code>{`{
  "header": { "style": "band" },
  "style": {
    "font_family":    "Helvetica Neue",
    "header_bg":      "#0f172a",
    "accent":         "#f59e0b",
    "body_size":      9.0,
    "line_height":    0.75,
    "show_footer":    "true",
    "show_contact_icons": "true"
  },
  "sections": [
    { "id": "summary",    "breakable": true },
    { "id": "experience", "breakable": true }
  ]
}`}</Code>
        </Section>

        {/* ── 5. Tips ──────────────────────────────────────────────────── */}
        <Section id="tips" title="5 · Tips for agents">
          <div className="space-y-4">
            {[
              {
                title: 'Collect contact types carefully',
                body: 'Use the exact type strings (email, phone, location, linkedin, github, medium, web). The "key" field is the display label — it can be anything ("Email", "E-mail", "Work email" all render fine). The "value" for linkedin/github should be the full URL or just the path (both work).',
              },
              {
                title: 'summary uses \\n\\n for paragraphs',
                body: 'The summary field is plain text. To create multiple paragraphs, separate them with a double newline (\\n\\n). Single newlines are treated as spaces.',
              },
              {
                title: 'Tags are decorative pills',
                body: 'The "tags" array on experience, side_projects, and certifications renders as small grey pills at the bottom of the entry. Keep them short (1–3 words). For certifications, the special tag "expired" renders a warning style.',
              },
              {
                title: 'Links work anywhere in text fields',
                body: 'highlights, description, and summary all support [text](url) Markdown links. You can also link to another section in the PDF with [text](#section-id) — e.g. [see my projects](#side_projects).',
              },
              {
                title: 'Omit sections you have no data for',
                body: 'All top-level sections except identity are optional. Omitting them entirely is cleaner than including empty arrays.',
              },
              {
                title: 'subtitle is flexible',
                body: 'There is no strict format for subtitle. Common conventions: "Company · Location" for experience, "Degree · Field" for education, "Issuer · Year" for certifications. The · separator is just a display convention.',
              },
            ].map((t) => (
              <div key={t.title} style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 3,
                    background: 'var(--c-accent-soft)',
                    borderRadius: 99,
                    marginTop: 4,
                    border: '1px solid var(--c-accent)',
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--c-ink)',
                      marginBottom: 4,
                    }}
                  >
                    {t.title}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--c-sub)', lineHeight: 1.65 }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--c-line)',
            padding: '2rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              color: 'var(--c-faint)',
              letterSpacing: '0.08em',
            }}
          >
            Proof schema reference
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a
              href="/llms-full.txt"
              className="mono-link"
              style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-faint)' }}
            >
              llms-full.txt
            </a>
            <a
              href="/llms.txt"
              className="mono-link"
              style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--c-faint)' }}
            >
              llms.txt
            </a>
            <ProofButton href="/editor" variant="primary" size="sm">
              Open editor →
            </ProofButton>
          </div>
        </div>
      </div>
    </div>
  )
}
