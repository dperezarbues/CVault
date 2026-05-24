import Link from 'next/link'

export const metadata = {
  title: 'Privacy & Terms — CVault',
  description: 'What CVault does and does not do with your data.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-6 border-t border-gray-100">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold tracking-tight text-gray-900">
          CVault
        </Link>
        <Link href="/editor" className="text-sm text-blue-600 hover:text-blue-800">
          Open editor →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy &amp; Terms</h1>
          <p className="text-sm text-gray-400">Plain English. No legalese.</p>
        </div>

        <Section title="Your CV data">
          <p>
            Your CV data is stored exclusively in your browser&apos;s{' '}
            <code className="font-mono text-xs bg-gray-100 px-1 rounded">localStorage</code>. It
            never leaves your device except during PDF generation (see below). We have no database,
            no user accounts, and no server-side storage of CV content.
          </p>
          <p>
            If you clear your browser storage, your CV data is gone. There is no cloud backup. We
            recommend downloading your CV JSON periodically using the Download button in the editor.
          </p>
        </Section>

        <Section title="PDF generation">
          <p>
            When you click &ldquo;Generate PDF&rdquo;, your CV data never leaves your device. The{' '}
            <a
              href="https://typst.app"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Typst
            </a>{' '}
            compiler runs entirely in your browser as a WebAssembly module (~6 MB, downloaded once
            and cached). Compilation happens locally; no CV content is sent to any server at any
            point.
          </p>
          <p>
            The only network requests are: loading the compiler itself (from this site), loading
            fonts (also from this site), and the GoatCounter analytics beacon described below. Your
            CV data is never included in any of these requests.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            This site uses{' '}
            <a
              href="https://www.goatcounter.com"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GoatCounter
            </a>{' '}
            for basic traffic analytics. GoatCounter collects page views, referrer URLs, browser
            type, and country — no cookies, no fingerprinting, no personal data, no cross-site
            tracking.
          </p>
          <p>
            GoatCounter is open source and its privacy policy is available at{' '}
            <a
              href="https://www.goatcounter.com/help/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              goatcounter.com/help/privacy
            </a>
            .
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            CVault sets no cookies. Layout saves and CV data are stored in{' '}
            <code className="font-mono text-xs bg-gray-100 px-1 rounded">localStorage</code>, which
            is not a cookie and is never transmitted to the server automatically. GoatCounter also
            sets no cookies.
          </p>
        </Section>

        <Section title="Open source">
          <p>
            CVault is open source. You are welcome to inspect the code, self-host it, or contribute.
            The source code is the most authoritative description of what the tool actually does.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If anything material changes — particularly around data handling — this page will be
            updated. The date below reflects the last revision.
          </p>
          <p className="text-xs text-gray-400 pt-1">Last updated: May 2025</p>
        </Section>

        <div className="py-6 border-t border-gray-100 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Home
          </Link>
          <Link href="/editor" className="text-sm text-blue-600 hover:text-blue-800">
            Open editor →
          </Link>
        </div>
      </div>
    </div>
  )
}
