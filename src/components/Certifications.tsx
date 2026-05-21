import cv from '@/data/cv.json'

export default function Certifications() {
  return (
    <section className="mb-6">
      <h2 className="section-title">Certifications</h2>
      <div className="space-y-1">
        {cv.certifications.map((cert, i) => (
          <div key={i} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-gray-800">{cert.name}</span>
            <span className="shrink-0 text-gray-500">{cert.issuer} · {cert.year}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
