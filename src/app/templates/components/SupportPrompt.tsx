'use client'

type Props = {
  supportUrl: string
  downloadUrl: string
  onDismiss: () => void
}

export default function SupportPrompt({ supportUrl, downloadUrl, onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(23,19,14,0.46)' }}
    >
      <div
        className="relative w-80 mx-4 overflow-hidden"
        style={{
          background: 'var(--c-paper)',
          borderRadius: 7,
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top section */}
        <div className="px-6 pt-8 pb-5 flex flex-col items-center text-center">
          <p
            className="text-lg font-black uppercase tracking-tight mb-1"
            style={{ color: 'var(--c-ink)' }}
          >
            Your PDF is ready
          </p>
          <p className="text-xs font-mono mb-5" style={{ color: 'var(--c-sub)' }}>
            cv.pdf · A4
          </p>
          <a
            href={downloadUrl}
            download
            onClick={onDismiss}
            className="w-full text-sm font-bold text-center px-4 py-2.5 rounded-[4px] transition-colors flex items-center justify-center gap-2"
            style={{ background: 'var(--c-accent)', color: 'white' }}
          >
            <span>↓</span>
            <span>Download PDF</span>
          </a>
        </div>

        {/* Support card */}
        <div
          className="mx-5 mb-5 px-5 py-5 flex flex-col gap-3"
          style={{ background: 'var(--c-ink)', borderRadius: 6 }}
        >
          <div className="flex items-start gap-2">
            <span style={{ color: 'var(--c-accent)' }}>♥</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold" style={{ color: 'white' }}>
                Proof is free &amp; open source
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                If it saved you time, consider supporting the project — it keeps development going.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDismiss}
              className="flex-1 text-xs font-bold text-center px-3 py-2 rounded-[4px] transition-colors"
              style={{ background: 'var(--c-accent)', color: 'white' }}
            >
              Sponsor on GitHub
            </a>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDismiss}
              className="text-xs font-bold text-center px-3 py-2 rounded-[4px] transition-colors"
              style={{ color: 'white', boxShadow: 'inset 0 0 0 1.3px rgba(255,255,255,0.35)' }}
            >
              Star
            </a>
          </div>
        </div>

        {/* Maybe later */}
        <div className="pb-5 flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-mono transition-colors"
            style={{ color: 'var(--c-faint)' }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
