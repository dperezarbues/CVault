import Link from 'next/link'
import CropMarks from '@/components/proof/CropMarks'
import MarkProof from '@/components/proof/MarkProof'
import MonoLabel from '@/components/proof/MonoLabel'

export const metadata = {
  title: '404 — Proof',
}

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: 'var(--c-paper)', color: 'var(--c-ink)' }}
    >
      {/* Nav strip */}
      <div
        className="fixed top-0 inset-x-0 flex items-center px-10 py-4"
        style={{ borderBottom: '1px solid var(--c-line)' }}
      >
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <MarkProof size={26} />
          <span
            className="font-black text-[18px] tracking-[-0.02em]"
            style={{ color: 'var(--c-ink)' }}
          >
            Proof
          </span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center text-center max-w-lg">
        <CropMarks color="var(--c-line)" gap={-20} len={22} strokeWidth={1.2} />

        <MonoLabel style={{ color: 'var(--c-accent)', marginBottom: '1.5rem' }}>
          Error · 404
        </MonoLabel>

        <h1
          className="font-black uppercase leading-none tracking-[-0.04em]"
          style={{ fontSize: 'clamp(96px, 20vw, 160px)', color: 'var(--c-ink)', lineHeight: 0.88 }}
        >
          404
        </h1>

        <p
          className="text-[17px] leading-[1.6] mt-8 mb-10"
          style={{ color: 'var(--c-sub)', maxWidth: 360 }}
        >
          This page doesn&apos;t exist — or was moved. The CV you&apos;re looking for is probably
          still in your browser.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-bold text-[14px] px-6 py-3 rounded-[3px] uppercase tracking-wider transition-opacity hover:opacity-80"
            style={{ background: 'var(--c-ink)', color: 'var(--c-paper)' }}
          >
            ← Home
          </Link>
          <Link
            href="/editor"
            className="font-bold text-[14px] px-6 py-3 rounded-[3px] uppercase tracking-wider transition-opacity hover:opacity-80"
            style={{ background: 'var(--c-accent)', color: '#fff' }}
          >
            Open editor
          </Link>
        </div>

        <MonoLabel className="mt-12">Nothing stored · Nothing lost</MonoLabel>
      </div>
    </div>
  )
}
