import Link from 'next/link'
import MarkProof from '@/components/proof/MarkProof'
import ProofButton from '@/components/proof/ProofButton'

export const metadata = {
  title: 'Privacy & Terms — Proof',
  description: 'What Proof does and does not do with your data.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--c-line)',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--c-accent)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </p>
      <div style={{ fontSize: 14, color: 'var(--c-sub)', lineHeight: 1.65 }} className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-paper)' }}>
      <nav
        style={{
          maxWidth: 672,
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
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
        <ProofButton href="/editor" variant="primary" size="sm">
          Open editor →
        </ProofButton>
      </nav>

      <div style={{ maxWidth: 672, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
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
            Privacy &amp; Terms
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-faint)' }}>Plain English. No legalese.</p>
        </div>

        <Section title="Your CV data">
          <p>
            Your CV data is stored exclusively in your browser&apos;s{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
              }}
            >
              localStorage
            </code>
            . It never leaves your device except during PDF generation (see below). We have no
            database, no user accounts, and no server-side storage of CV content.
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
              style={{ color: 'var(--c-accent)' }}
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
              style={{ color: 'var(--c-accent)' }}
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
              style={{ color: 'var(--c-accent)' }}
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
            Proof sets no cookies. Layout saves and CV data are stored in{' '}
            <code
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                background: 'var(--c-card)',
                padding: '2px 6px',
                borderRadius: 3,
              }}
            >
              localStorage
            </code>
            , which is not a cookie and is never transmitted to the server automatically.
            GoatCounter also sets no cookies.
          </p>
        </Section>

        <Section title="Open source">
          <p>
            Proof is open source. You are welcome to inspect the code, self-host it, or contribute.
            The source code is the most authoritative description of what the tool actually does.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If anything material changes — particularly around data handling — this page will be
            updated. The date below reflects the last revision.
          </p>
          <p style={{ fontSize: 12, color: 'var(--c-faint)', paddingTop: '0.25rem' }}>
            Last updated: May 2025
          </p>
        </Section>

        <div
          style={{
            borderTop: '1px solid var(--c-line)',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ fontSize: 13, color: 'var(--c-faint)', textDecoration: 'none' }}>
            ← Home
          </Link>
          <ProofButton href="/editor" variant="primary" size="sm">
            Open editor →
          </ProofButton>
        </div>
      </div>
    </div>
  )
}
