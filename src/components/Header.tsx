'use client'

import cv from '@/data/cv.json'

export default function Header() {
  const { name, headline, location, email } = cv.identity

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{name}</h1>
          <p className="mt-1 text-lg text-gray-500">{headline}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print mt-1 shrink-0 rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Download PDF
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
        <span>{location}</span>
        <a href={`mailto:${email}`} className="hover:text-gray-900 transition-colors">
          {email}
        </a>
      </div>
    </header>
  )
}
