import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Archivo, Space_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--f-display',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--f-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Proof — Privacy-first CV editor',
  description:
    'Generate your CV with any AI from an open schema, proof and style it, and export a flawless PDF — nothing ever leaves your device.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${spaceMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
