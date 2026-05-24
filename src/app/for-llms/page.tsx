import Link from 'next/link'

export const metadata = {
  title: 'Schema Reference — CVault',
  description:
    'Complete CV JSON schema and layout/style reference for CVault. For LLMs and agents generating CV data.',
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
    <section id={id} className="py-8 border-t border-gray-100 scroll-mt-20">
      <h2 className="text-base font-bold text-gray-900 mb-5">{title}</h2>
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
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
        <code className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
          {name}
        </code>
        <span className="text-xs text-gray-400 font-mono">{type}</span>
        {req && <span className="text-xs text-red-500 font-medium">required</span>}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      {children}
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto leading-relaxed whitespace-pre">
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
  const cls = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
  }[color]
  return <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cls}`}>{children}</span>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForLlmsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-3 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-gray-900">
            CVault
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-500">Schema reference</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/llms-full.txt" className="text-xs text-gray-400 hover:text-gray-600 font-mono">
            llms-full.txt
          </a>
          <a href="/llms.txt" className="text-xs text-gray-400 hover:text-gray-600 font-mono">
            llms.txt
          </a>
          <Link
            href="/editor"
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Open editor →
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schema Reference</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
            Complete reference for generating valid CVault data. Covers the CV content JSON, layout
            structure, and all style parameters for each template. Intended for LLMs and agents
            producing CV files for import.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
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
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── 1. CV JSON ────────────────────────────────────────────────── */}
        <Section id="cv-json" title="1 · CV JSON schema">
          <p className="text-sm text-gray-500 mb-5">
            The CV is a single JSON object. All sections are optional except{' '}
            <code className="text-xs font-mono bg-gray-100 px-1 rounded">identity</code>. Text
            fields in <code className="text-xs font-mono bg-gray-100 px-1 rounded">highlights</code>
            , <code className="text-xs font-mono bg-gray-100 px-1 rounded">description</code>, and{' '}
            <code className="text-xs font-mono bg-gray-100 px-1 rounded">summary</code> support
            Markdown-style links:{' '}
            <code className="text-xs font-mono bg-gray-100 px-1 rounded">[text](https://url)</code>.
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

          <div className="mt-6 space-y-0.5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              identity.contact — type values
            </h3>
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
                <div key={t} className="bg-gray-50 rounded-lg px-3 py-2">
                  <code className="text-xs font-mono text-blue-700">{t}</code>
                  <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. Section IDs ───────────────────────────────────────────── */}
        <Section id="sections" title="2 · Available section IDs">
          <p className="text-sm text-gray-500 mb-4">
            These are the built-in section IDs that the editor and templates know about. The sidebar
            template can also render any of these in the left column.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-6 font-semibold">ID</th>
                  <th className="pb-2 pr-6 font-semibold">JSON key</th>
                  <th className="pb-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
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
                  <tr key={id} className="text-gray-700">
                    <td className="py-2 pr-6">
                      <code className="text-xs font-mono text-blue-700">{id}</code>
                    </td>
                    <td className="py-2 pr-6">
                      <code className="text-xs font-mono text-gray-500">{key}</code>
                    </td>
                    <td className="py-2 text-xs text-gray-500">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Custom sections: any top-level key not listed above is rendered generically (supports
            strings, string arrays, and arrays of objects with title/subtitle/description).
          </p>
        </Section>

        {/* ── 3. Layout JSON ───────────────────────────────────────────── */}
        <Section id="layout" title="3 · Layout JSON structure">
          <p className="text-sm text-gray-500 mb-5">
            When you generate a PDF from the editor, a layout JSON is compiled alongside the CV
            data. You can also produce layout JSON directly to control section order, columns, and
            per-section spacing.
          </p>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Top-level fields
          </h3>
          <div className="space-y-0">
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

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-3">
            Section entry — full type
          </h3>
          <Code>{`{ "id": "experience", "breakable": true, "pre_spacing": 0.5, "post_spacing": 0.2 }`}</Code>
          <div className="mt-3 space-y-0">
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

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-3">
            Section entry — columns type
          </h3>
          <Code>{`{
  "type": "columns",
  "columns": 2,
  "breakable": true,
  "content": [
    ["education", "languages"],
    ["certifications"]
  ]
}`}</Code>
          <div className="mt-3 space-y-0">
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

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-3">
            Complete layout examples
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">Default / Minimal</p>
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
              <p className="text-xs text-gray-400 mb-2">Sidebar</p>
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
          <p className="text-sm text-gray-500 mb-5">
            Style values live in the{' '}
            <code className="text-xs font-mono bg-gray-100 px-1 rounded">style</code> key of the
            layout JSON. All are optional — omit any to use the template default.
          </p>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Common — all templates
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-4 font-semibold">Key</th>
                  <th className="pb-2 pr-4 font-semibold">Type</th>
                  <th className="pb-2 pr-4 font-semibold">Range / options</th>
                  <th className="pb-2 font-semibold">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
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
                  <tr key={k} className="text-gray-700">
                    <td className="py-1.5 pr-4 text-blue-700">{k}</td>
                    <td className="py-1.5 pr-4 text-gray-500">{t}</td>
                    <td className="py-1.5 pr-4 text-gray-500 font-sans text-xs">{r}</td>
                    <td className="py-1.5 text-gray-500">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Template-specific — <Tag color="blue">default</Tag> &amp;{' '}
            <Tag color="blue">minimal</Tag>
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-4 font-semibold">Key</th>
                  <th className="pb-2 pr-4 font-semibold">Default</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
                <tr className="text-gray-700">
                  <td className="py-1.5 pr-4 text-blue-700">accent_color</td>
                  <td className="py-1.5 pr-4">#1a56db</td>
                  <td className="py-1.5 font-sans text-gray-500">Hyperlinks and section accents</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Template-specific — <Tag color="green">modern</Tag>
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-4 font-semibold">Key</th>
                  <th className="pb-2 pr-4 font-semibold">Default</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
                {[
                  ['header_bg', '#111827', 'Dark band header background'],
                  ['accent', '#3b82f6', 'Hyperlinks and accent elements'],
                ].map(([k, d, p]) => (
                  <tr key={k} className="text-gray-700">
                    <td className="py-1.5 pr-4 text-blue-700">{k}</td>
                    <td className="py-1.5 pr-4">{d}</td>
                    <td className="py-1.5 font-sans text-gray-500">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Template-specific — <Tag>sidebar</Tag>
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-4 font-semibold">Key</th>
                  <th className="pb-2 pr-4 font-semibold">Default</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
                {[
                  ['sidebar_bg', '#1e2d3d', 'Sidebar background colour'],
                  ['sidebar_accent', '#5b9bd5', 'Sidebar section heading colour'],
                  ['sidebar_link_color', '#5b9bd5', 'Links and icons in the sidebar'],
                  ['sidebar_text', '#bcc8d4', 'Body text in the sidebar'],
                  ['sidebar_width', '6.5', 'Sidebar width in cm (4.5 – 9.0)'],
                  ['accent_color', '#1a56db', 'Links in the main column'],
                ].map(([k, d, p]) => (
                  <tr key={k} className="text-gray-700">
                    <td className="py-1.5 pr-4 text-blue-700">{k}</td>
                    <td className="py-1.5 pr-4">{d}</td>
                    <td className="py-1.5 font-sans text-gray-500">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-3">
            Style embedded in layout — example
          </h3>
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
              <div key={t.title} className="flex gap-4">
                <div className="shrink-0 w-1 bg-blue-100 rounded-full mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{t.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="py-8 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">CVault schema reference</span>
          <div className="flex items-center gap-4">
            <a
              href="/llms-full.txt"
              className="text-xs text-gray-400 hover:text-gray-600 font-mono"
            >
              llms-full.txt
            </a>
            <a href="/llms.txt" className="text-xs text-gray-400 hover:text-gray-600 font-mono">
              llms.txt
            </a>
            <Link href="/editor" className="text-sm text-blue-600 hover:text-blue-800">
              Open editor →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
