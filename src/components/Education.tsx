import cv from '@/data/cv.json'

export default function Education() {
  return (
    <section className="mb-6">
      <h2 className="section-title">Education</h2>
      <div className="space-y-4">
        {cv.education.map((edu, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="job-title">{edu.institution}</span>
              <span className="job-meta shrink-0">{edu.period}</span>
            </div>
            <div className="job-meta">{edu.degree}</div>
            <div className="mt-1 text-xs text-gray-500">{edu.equivalent}</div>
            <p className="mt-1 text-sm text-gray-600">{edu.notes}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
