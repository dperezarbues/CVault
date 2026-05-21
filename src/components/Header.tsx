import cv from '@/data/cv.json'

export default function Header() {
  const { name, headline, location, email, phone, linkedin } = cv.identity

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{name}</h1>
          <p className="mt-1 text-lg text-gray-500">{headline}</p>
        </div>
        <div className="no-print flex flex-col items-end gap-1">
          <a
            href="/cv.pdf"
            download
            className="shrink-0 rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors"
          >
            Download PDF
          </a>
          <span className="text-xs text-gray-400">Typst · vector · links</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>{location}</span>
        <span className="text-gray-300 select-none">·</span>
        <a href={`mailto:${email}`} className="hover:text-gray-900 transition-colors">{email}</a>
        <span className="text-gray-300 select-none">·</span>
        <span>{phone}</span>
        <span className="text-gray-300 select-none">·</span>
        <span>{linkedin}</span>
      </div>
    </header>
  )
}
