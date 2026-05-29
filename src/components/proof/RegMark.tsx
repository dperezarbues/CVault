type Props = {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export default function RegMark({
  size = 22,
  color = 'var(--c-ink)',
  strokeWidth = 1.6,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
    >
      <title>Registration mark</title>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 0.5V7M12 17v6.5M0.5 12H7M17 12h6.5" strokeLinecap="round" />
    </svg>
  )
}
