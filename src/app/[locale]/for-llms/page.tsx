import { routing } from '@/i18n/routing'
import ForLlmsRedirect from './ForLlmsRedirect'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Schema reference is English-only developer documentation.
// Render a client component that redirects to the canonical /for-llms path.
export default function ForLlmsLocalePage() {
  return <ForLlmsRedirect />
}
