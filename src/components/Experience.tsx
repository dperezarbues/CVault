import cv from '@/data/cv.json'

export default function Experience() {
  return (
    <section className="mb-8">
      <h2 className="section-title">Experience</h2>
      <div className="space-y-6">
        {cv.experience.map((job, i) => (
          <div key={i} className="job-entry">
            <div className="flex items-baseline justify-between gap-2">
              <span className="job-title">{job.company}</span>
              <span className="job-meta shrink-0">{job.period}</span>
            </div>
            <div className="job-meta">{job.title} · {job.location}</div>
            <ul className="job-highlights">
              {job.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
            <div className="stack-pills">
              {job.stack.map((s, j) => (
                <span key={j} className="stack-pill">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
