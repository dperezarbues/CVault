type Props = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function MonoLabel({ children, className = '', style }: Props) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.16em] uppercase ${className}`}
      style={{ color: 'var(--c-faint)', ...style }}
    >
      {children}
    </span>
  )
}
