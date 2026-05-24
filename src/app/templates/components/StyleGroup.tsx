'use client'

import { useState } from 'react'

export default function StyleGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="flex items-center justify-between w-full py-2 text-left hover:text-gray-700 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {title}
        </span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="space-y-3 pb-3">{children}</div>}
    </div>
  )
}
