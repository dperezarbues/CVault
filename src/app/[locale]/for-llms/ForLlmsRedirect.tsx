'use client'

import { useEffect } from 'react'

export default function ForLlmsRedirect() {
  useEffect(() => {
    window.location.replace('/for-llms')
  }, [])
  return null
}
