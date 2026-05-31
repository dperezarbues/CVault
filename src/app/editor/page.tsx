'use client'

import { useEffect } from 'react'

export default function EditorRedirect() {
  useEffect(() => {
    const lang = navigator.language.slice(0, 2).toLowerCase()
    const supported = ['en', 'fr', 'de', 'es']
    const locale = supported.includes(lang) ? lang : 'en'
    window.location.replace(`/${locale}/editor`)
  }, [])
  return null
}
