import Link from 'next/link'

type Props = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'dark' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const STYLES: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--c-accent)', color: '#fff' },
  dark: { background: 'var(--c-ink)', color: 'var(--c-paper)' },
  ghost: {
    background: 'transparent',
    color: 'var(--c-ink)',
    boxShadow: 'inset 0 0 0 1.5px var(--c-ink)',
  },
}

export default function ProofButton({ href, children, variant = 'primary', size = 'md' }: Props) {
  const pad = size === 'lg' ? 'px-7 py-4' : size === 'sm' ? 'px-3.5 py-2' : 'px-5 py-3'
  const text = size === 'lg' ? 'text-[15px]' : 'text-[13.5px]'

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-bold rounded-[3px] uppercase tracking-wider whitespace-nowrap transition-opacity hover:opacity-90 ${pad} ${text}`}
      style={STYLES[variant]}
    >
      {children}
    </Link>
  )
}
