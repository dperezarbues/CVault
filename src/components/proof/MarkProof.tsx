type Props = {
  size?: number
  color?: string
  ink?: string
  className?: string
}

export default function MarkProof({
  size = 40,
  color = 'var(--c-accent)',
  ink = 'var(--c-ink)',
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <title>Proof mark</title>
      <rect x="11" y="11" width="18" height="18" rx="2.5" fill={color} />
      <path
        d="M4 11H8M11 4V8M36 11H32M29 4V8M4 29H8M11 36V32M36 29H32M29 36V32"
        stroke={ink}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  )
}
