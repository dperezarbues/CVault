import './globals.css'

// Root layout: minimal passthrough. Each [locale] layout provides
// the html/body shell with the correct lang attribute and fonts.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
