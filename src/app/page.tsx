import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight">CVault</span>
          <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium">beta</span>
        </div>
        <Link
          href="/editor"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Open editor →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-5">
          Build a great CV.<br />
          <span className="text-gray-400">Keep your data yours.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          A live CV editor that compiles beautiful PDFs with Typst.
          No accounts, no cloud — your data lives in your browser.
        </p>
        <Link
          href="/editor"
          className="inline-block text-base bg-blue-600 text-white px-7 py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-8">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {([
            {
              n: '1',
              title: 'Add your CV',
              body: 'Paste your CV as JSON or start from the built-in template. Everything is stored locally in your browser — nothing leaves your device until you generate.',
            },
            {
              n: '2',
              title: 'Pick a template',
              body: 'Choose from 4 professional layouts. Drag sections to reorder, tweak colors, fonts, and spacing with a live visual editor.',
            },
            {
              n: '3',
              title: 'Generate & download',
              body: 'Hit Generate. Your CV is compiled with Typst directly in your browser — no data leaves your device. Download the PDF when you\'re happy.',
            },
          ] as const).map(s => (
            <div key={s.n} className="bg-gray-50 rounded-2xl p-6">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center mb-4">
                {s.n}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {([
          {
            title: 'Privacy-first',
            body: 'PDF compilation runs in your browser via WebAssembly — your CV data never leaves your device. No server, no database, no logs, no accounts.',
          },
          {
            title: '4 professional templates',
            body: 'Default, Sidebar, Modern, and Minimal — each fully customisable through the visual editor with live preview.',
          },
          {
            title: 'Typst-powered PDFs',
            body: 'Typst produces precise, beautiful documents. The output looks identical every time, across every OS and viewer.',
          },
          {
            title: 'Open JSON format',
            body: 'Your CV is a plain JSON file you can import, export, edit in any text editor, and version-control however you like.',
          },
        ] as const).map(f => (
          <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* CTA banner */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gray-900 text-white rounded-2xl px-8 py-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to build your CV?</h2>
          <p className="text-gray-400 text-sm mb-6">Takes 2 minutes to import your data and generate your first PDF.</p>
          <Link
            href="/editor"
            className="inline-block text-sm bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Open the editor →
          </Link>
        </div>
      </section>

      {/* Schema reference */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">Want to understand the CV format?</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              The schema reference documents the full JSON structure — every section type, field, and style option. Useful whether you&apos;re hand-editing your CV, writing a script to generate it, or prompting an AI assistant to produce an importable file.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link href="/for-llms" className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium">
              Schema reference
            </Link>
            <a href="/llms-full.txt" className="text-xs text-gray-400 hover:text-gray-600 font-mono">
              llms-full.txt
            </a>
            <a href="/llms.txt" className="text-xs text-gray-400 hover:text-gray-600 font-mono">
              llms.txt
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">CVault — open source, privacy-first</span>
          <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Privacy &amp; Terms</Link>
        </div>
        <Link href="/editor" className="text-sm text-blue-600 hover:text-blue-800">
          Open editor →
        </Link>
      </footer>

    </div>
  )
}
