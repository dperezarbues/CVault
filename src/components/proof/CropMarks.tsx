type Props = {
  color?: string
  gap?: number
  len?: number
  strokeWidth?: number
}

export default function CropMarks({
  color = 'var(--c-ink)',
  gap = -9,
  len = 13,
  strokeWidth = 1.5,
}: Props) {
  const b = `${strokeWidth}px solid ${color}`
  const base: React.CSSProperties = {
    position: 'absolute',
    width: len,
    height: len,
    pointerEvents: 'none',
  }
  return (
    <>
      <span style={{ ...base, top: gap, left: gap, borderTop: b, borderLeft: b }} aria-hidden />
      <span style={{ ...base, top: gap, right: gap, borderTop: b, borderRight: b }} aria-hidden />
      <span
        style={{ ...base, bottom: gap, left: gap, borderBottom: b, borderLeft: b }}
        aria-hidden
      />
      <span
        style={{ ...base, bottom: gap, right: gap, borderBottom: b, borderRight: b }}
        aria-hidden
      />
    </>
  )
}
