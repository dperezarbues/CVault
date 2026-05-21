import cv from '@/data/cv.json'

export default function Awards() {
  if (!cv.awards?.length) return null

  return (
    <section className="mb-6">
      <h2 className="section-title">Awards &amp; Recognition</h2>
      <div className="space-y-3">
        {cv.awards.map((award, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="job-title text-sm">{award.name}</span>
              <span className="job-meta shrink-0">{award.issuer} · {award.date}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{award.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
