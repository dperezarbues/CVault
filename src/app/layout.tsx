import type { Metadata } from 'next'
import './globals.css'
import cv from '@/data/cv.json'

export const metadata: Metadata = {
  title: `${cv.identity.name} — CV`,
  description: cv.summary.slice(0, 160),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
