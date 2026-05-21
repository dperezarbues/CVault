import cv from '@/data/cv.json'

export default function SideProjects() {
  if (!cv.side_projects?.length) return null

  return (
    <section className="mb-6">
      <h2 className="section-title">Side Projects &amp; Interests</h2>
      <div className="space-y-3">
        {cv.side_projects.map((project, i) => (
          <div key={i} className="flex gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="job-title text-sm">{project.name}</span>
                <span className="shrink-0 text-xs text-gray-400">{project.status}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{project.description}</p>
              {project.stack && project.stack.length > 0 && (
                <div className="stack-pills">
                  {project.stack.map((tech, j) => (
                    <span key={j} className="stack-pill">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
