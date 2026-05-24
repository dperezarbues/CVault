/** Resolves the URL to encode as a QR code. Falls back to the LinkedIn contact entry, then a placeholder. */
export function resolveQrUrl(cvContent: string, style: Record<string, unknown>): string {
  const explicit = String(style.qr_url ?? '').trim()
  if (explicit) {
    try {
      const url = explicit.startsWith('http') ? explicit : `https://${explicit}`
      new URL(url) // throws if malformed
      return url
    } catch {
      // fall through to LinkedIn detection
    }
  }
  try {
    const cv = JSON.parse(cvContent) as {
      identity?: { contact?: Array<{ type: string; value: string }>; linkedin?: string }
    }
    const contact = cv.identity?.contact ?? []
    const linkedinEntry = contact.find((e) => e.type === 'linkedin')
    const val = linkedinEntry?.value ?? cv.identity?.linkedin ?? ''
    if (!val) return 'https://linkedin.com'
    const url = val.startsWith('http') ? val : `https://${val}`
    new URL(url) // throws if malformed
    return url
  } catch {
    return 'https://linkedin.com'
  }
}
