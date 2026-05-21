import cv from '@/data/cv.json'

const LABELS: Record<string, string> = {
  languages_and_frameworks: 'Languages & Frameworks',
  cloud_and_infra: 'Cloud & Infrastructure',
  data_and_messaging: 'Data & Messaging',
  observability_and_tooling: 'Observability & Tooling',
  methodologies: 'Methodologies',
}

export default function Skills() {
  return (
    <section className="mb-8">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {(Object.entries(cv.skills) as [string, string[]][]).map(([key, items]) => (
          <div key={key}>
            <div className="skill-group-label">{LABELS[key] ?? key}</div>
            <div className="skill-group-items">{items.join(' · ')}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
