'use client'

import { useEffect } from 'react'

const SUPPORTED = ['en', 'fr', 'de', 'es']

// Root redirect: detects browser locale and sends to the matching /[locale]/ URL.
export default function Root() {
  useEffect(() => {
    const lang = navigator.language.slice(0, 2).toLowerCase()
    const locale = SUPPORTED.includes(lang) ? lang : 'en'
    window.location.replace(`/${locale}/`)
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="refresh" content="0; url=/en/" />
      </head>
      <body />
    </html>
  )
}
