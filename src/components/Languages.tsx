import cv from '@/data/cv.json'

export default function Languages() {
  return (
    <section>
      <h2 className="section-title">Languages</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {cv.languages.map((l, i) => (
          <div key={i} className="text-sm">
            <span className="font-medium text-gray-800">{l.language}</span>
            <span className="ml-1 text-gray-500">{l.level}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
