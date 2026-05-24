import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CVault — Privacy-first CV editor',
  description:
    'Build a professional CV with a live editor. Compiles to PDF with Typst. Your data lives in your browser — no accounts, no cloud storage.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
