'use client'

import MarkProof from '@/components/proof/MarkProof'

const STEPS = [
  {
    step: '1',
    title: 'Add your CV',
    body: 'Use "+ New" to create a CV from the template, or "↑ Import" to load an existing JSON file. You can have multiple CVs and switch between them.',
  },
  {
    step: '2',
    title: 'Pick a template & customise',
    body: 'Select a template from the list. The middle panel lets you reorder sections, toggle page breaks, and adjust colors, fonts, and spacing.',
  },
  {
    step: '3',
    title: 'Generate your PDF',
    body: 'Hit "Generate PDF" in the editor panel. Your CV is compiled with Typst and the PDF appears in the preview. Download whenever you\'re happy.',
  },
] as const

type Props = {
  privateMode: boolean
  onPrivateToggle: (enabled: boolean) => void
  onDismiss: () => void
}

export default function OnboardingModal({ privateMode, onPrivateToggle, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        style={{
          background: 'var(--c-paper)',
          borderRadius: 6,
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          width: '100%',
          maxWidth: 448,
          margin: '0 1rem',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '2rem 2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <MarkProof size={26} />
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--c-ink)',
              }}
            >
              Welcome to Proof
            </span>
          </div>
          <p
            style={{ fontSize: 13, color: 'var(--c-sub)', lineHeight: 1.6, marginBottom: '1.5rem' }}
          >
            A privacy-first CV editor. Your data is stored in this browser — nothing is saved
            server-side.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {STEPS.map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 3,
                    background: 'var(--c-accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--c-accent)',
                    letterSpacing: '0',
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--c-ink)',
                      marginBottom: 2,
                      fontFamily: 'var(--f-display)',
                    }}
                  >
                    {s.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--c-sub)', lineHeight: 1.6 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: 'var(--c-card)',
              borderRadius: 4,
              padding: '12px 14px',
              border: '1px solid var(--c-line)',
            }}
          >
            <input
              type="checkbox"
              id="private-mode-toggle"
              checked={privateMode}
              onChange={(e) => onPrivateToggle(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <label
              htmlFor="private-mode-toggle"
              style={{ fontSize: 12, color: 'var(--c-sub)', lineHeight: 1.6, cursor: 'pointer' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--c-ink)' }}>
                I&apos;m on a shared computer
              </span>
              <br />
              Data will be stored in session storage and cleared automatically when this tab closes.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 2rem',
            background: 'var(--c-paper-deep)',
            borderTop: '1px solid var(--c-line)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--c-faint)',
            }}
          >
            Reopen via the ? button
          </p>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'var(--c-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              padding: '8px 20px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--f-display)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  )
}
