import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import MarkProof from '@/components/proof/MarkProof'
import { Link } from '@/i18n/navigation'
import { type Locale, routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
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

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations('terms')

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
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 font-bold rounded-[3px] uppercase tracking-wider whitespace-nowrap transition-opacity hover:opacity-90 px-3.5 py-2 text-[13.5px]"
          style={{ background: 'var(--c-accent)', color: '#fff' }}
        >
          {t('openEditor')}
        </Link>
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
            {t('title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-faint)' }}>{t('subtitle')}</p>
        </div>

        <Section title={t('s1Title')}>
          <p>{t('s1p1')}</p>
          <p>{t('s1p2')}</p>
        </Section>

        <Section title={t('s2Title')}>
          <p>
            {t('s2p1')}{' '}
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
          <p>{t('s2p2')}</p>
        </Section>

        <Section title={t('s3Title')}>
          <p>
            {t('s3p1')}{' '}
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
            {t('s3p2')}{' '}
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

        <Section title={t('s4Title')}>
          <p>{t('s4p1')}</p>
        </Section>

        <Section title={t('s5Title')}>
          <p>{t('s5p1')}</p>
        </Section>

        <Section title={t('s6Title')}>
          <p>{t('s6p1')}</p>
          <p style={{ fontSize: 12, color: 'var(--c-faint)', paddingTop: '0.25rem' }}>
            {t('s6date')}
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
            {t('backHome')}
          </Link>
          <Link
            href="/editor"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '0.375rem 0.875rem',
              background: 'var(--c-accent)',
              color: 'white',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            {t('openEditor')}
          </Link>
        </div>
      </div>
    </div>
  )
}
