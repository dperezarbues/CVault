import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CVault — Privacy-first CV editor',
  description: 'Build a professional CV with a live editor. Compiles to PDF with Typst. Your data lives in your browser — no accounts, no cloud storage.',
}

const GOATCOUNTER_CODE = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {GOATCOUNTER_CODE && (
          <script
            data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
            async
            src="//gc.zgo.at/count.js"
          />
        )}
      </body>
    </html>
  )
}
